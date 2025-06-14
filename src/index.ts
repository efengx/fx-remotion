// This is your entry file! Refer to it when you render:
// npx remotion render <entry-file> HelloWorld out/video.mp4

import { registerRoot } from "remotion";
import { RemotionRoot } from "./Root";
import {registerUsageEvent} from '@remotion/licensing';
 
registerUsageEvent({
  apiKey: 'rm_pub_54d878bd0cd77db7588a90c243b92a6df43c7ca1f1b732e5',
  event: 'webcodec-conversion',
  host: 'localhost',
  succeeded: true,
});

registerRoot(RemotionRoot);
