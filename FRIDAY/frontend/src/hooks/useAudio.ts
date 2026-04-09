import { useState, useRef, useCallback } from 'react';

export function useAudio(onAudioData: (data: Blob) => void) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          onAudioData(event.data);
        }
      };

      // Record in 500ms chunks to stream to backend
      mediaRecorder.current.start(500);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  }, [onAudioData]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  }, []);

  return { isRecording, startRecording, stopRecording };
}
