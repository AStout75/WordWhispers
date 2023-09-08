import React, { PropsWithChildren } from 'react'

export interface FlexBoxProps {
    classes: string;
}

export default function FlexBox(props: PropsWithChildren<FlexBoxProps>) {
    return (
        <div className={"d-flex " + props.classes}>
            {props.children}
        </div>
    )
}