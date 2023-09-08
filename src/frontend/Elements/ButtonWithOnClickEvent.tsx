import React from 'react'

export interface ButtonWithOnClickEventProps {
    onClick: Function;
    wrapperClass: string;
    buttonClass: string;
    buttonText: string;
    disabled: boolean;
}

export default function ButtonWithOnClickEvent(props: ButtonWithOnClickEventProps) {
    return (
        <div className={props.wrapperClass}>
            <button type="button" disabled={props.disabled} className={props.buttonClass} onClick={() => {props.onClick()}}>{props.buttonText}</button>
        </div>
    )
}