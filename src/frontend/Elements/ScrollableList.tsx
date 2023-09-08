import React, { PropsWithChildren } from 'react'

export interface ScrollableListProps {
    classes: string;
}

export default function ScrollableList(props: PropsWithChildren<ScrollableListProps>) {
    return (
        <div className={props.classes}>
            {props.children}
        </div>
    )
}