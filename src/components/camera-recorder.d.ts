export interface CameraRecorderProps {
  onVideoReady: (uri: string) => void;
  onBack: () => void;
}
export function CameraRecorder(props: CameraRecorderProps): React.JSX.Element;
