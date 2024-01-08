import FlexBox from "./FlexBox";
import React from 'react'

export function FancyHRTitle(props: {text: string, titleClass: string}) {
    return (
        <FlexBox classes="justify-content-center align-items-center game-panel-title">
            <hr />
            <div className={props.titleClass}>{props.text}</div>
            <hr />
        </FlexBox>
    )
}