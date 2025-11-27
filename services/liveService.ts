import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveConfig {
  apiKey: string;
  onAudioData: (base64Audio: string) => void;
  onTranscription: (text: string, isUser: boolean) => void;
  onError: (error: Error) => void;
}

export class LiveService {
  private client: GoogleGenAI;
  private session: any = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private nextStartTime = 0;
  private isConnected = false;

  constructor(apiKey: string) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async connect(config: LiveConfig) {
    if (this.isConnected) return;

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const sessionPromise = this.client.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          console.log("Live Session Opened");
          this.isConnected = true;
          // Setup Audio Input
          if (!this.inputAudioContext) return;
          this.inputSource = this.inputAudioContext.createMediaStreamSource(stream);
          this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
          
          this.processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = this.createBlob(inputData);
            sessionPromise.then((session: any) => {
               session.sendRealtimeInput({ media: pcmBlob });
            });
          };

          this.inputSource.connect(this.processor);
          this.processor.connect(this.inputAudioContext.destination);
        },
        onmessage: async (message: LiveServerMessage) => {
           // Handle Audio Output
           const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
           if (base64Audio) {
             await this.playAudio(base64Audio);
           }
           
           // Handle Transcriptions
           if (message.serverContent?.modelTurn?.parts[0]?.text) {
               config.onTranscription(message.serverContent.modelTurn.parts[0].text, false);
           }
        },
        onclose: () => {
            console.log("Live Session Closed");
            this.isConnected = false;
        },
        onerror: (err: any) => {
            config.onError(new Error("Live API Error"));
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: "Tu es un assistant médical IA utile. Tu écoutes une consultation et tu peux fournir des informations rapides ou transcrire. Réponds brièvement et précisément en français.",
      }
    });
    
    this.session = sessionPromise;
  }

  async disconnect() {
    if (this.session) {
      // There isn't a direct close method exposed on the promise wrapper in all versions, 
      // but usually we stop sending audio.
      // Ideally we would call session.close() if available.
    }
    
    if (this.processor && this.inputSource) {
        this.inputSource.disconnect();
        this.processor.disconnect();
    }
    
    if (this.inputAudioContext) await this.inputAudioContext.close();
    if (this.outputAudioContext) await this.outputAudioContext.close();
    
    this.isConnected = false;
    this.nextStartTime = 0;
  }

  private createBlob(data: Float32Array) {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    
    // Manual base64 encoding for the blob content
    let binary = '';
    const bytes = new Uint8Array(int16.buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64Data = btoa(binary);

    return {
      data: base64Data,
      mimeType: 'audio/pcm;rate=16000',
    };
  }

  private async playAudio(base64: string) {
    if (!this.outputAudioContext) return;

    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const audioBuffer = await this.decodeAudioData(bytes, this.outputAudioContext);
    
    const source = this.outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.outputAudioContext.destination);
    
    const now = this.outputAudioContext.currentTime;
    // Ensure we don't schedule in the past
    const startTime = Math.max(now, this.nextStartTime);
    source.start(startTime);
    this.nextStartTime = startTime + audioBuffer.duration;
  }

  private async decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
      const dataInt16 = new Int16Array(data.buffer);
      const sampleRate = 24000;
      const numChannels = 1;
      const frameCount = dataInt16.length / numChannels;
      
      const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
      const channelData = buffer.getChannelData(0);
      
      for(let i=0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
      }
      
      return buffer;
  }
}