import React from 'react';
import { AudioProps } from "./MyAudio.loader";

export const MyAudio: React.FC<AudioProps> = (props) => {
    console.log("===props:", props);

    return (
        <div>Audio</div>
    );
}
