import React, { useEffect, useState } from 'react'
import ButtonWithOnClickEvent from '../Elements/ButtonWithOnClickEvent';
import { sendJoinQueueCasualRequest, sendJoinQueueRankedRequest, sendViewLobbiesRequest } from '../Socket/socket-events';
import { PageProps, PageType, SetAppPageProps } from '../frontend-types/frontend-types';
import { useSocketContext } from '../Socket/socket-context';
import InfoPanel from '../Elements/InfoPanel';
import { animateButtons, animateTitleBottom, animateTitleTop } from '../Utils/animate-title';
import FlexBox from '../Elements/FlexBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import { IconDefinition, IconName } from '@fortawesome/fontawesome-svg-core';
import { getAccount, setAccount } from '../Store/account';
import { store } from '../Store/store';
import { updatePlayerAccount } from '../Store/Reducers/playerSlice';

export default function IndexPage(props: SetAppPageProps) {
    const socket = useSocketContext();
    const [name, setName] = useState(getAccount().username);
    const validName = name.length >= 3 && name.length <= 16;
    const clickedCustomLobbies = () => {
        //sendViewLobbiesRequest(socket);
        props.setPageState(PageType.Lobbies);
    };
    const clickedQueue = () => {
        //store.dispatch(updatePlayerAccount({ ...getAccount(), username: name }));
        sendViewLobbiesRequest(socket);
        setAccount({ ...getAccount(), username: name })
        props.setPageState(PageType.Lobbies);
        
    };
    const clickedSpectate = () => {
        props.setPageState(PageType.Lobbies);
    };
    const clickedRules = () => {

    }
    useEffect(() => {
        setTimeout(() => {animateTitleTop();}, 100);
        setTimeout(() => {animateTitleBottom();}, 300);
        setTimeout(() => {animateButtons();}, 400);

    }, []);
    return (
        <div>
            {/*<svg preserveAspectRatio="xMidYMid slice" viewBox="230.10431,230.8217,1313.10832,1076.60873"><path className="in-top" fill="#2B0504" d="M440,714c54.5019,13.33921 111.23452,13.75711 167.0001,13.93534c37.60818,0.1202 80.57502,0.53685 114.79297,-17.69133c15.77822,-8.40519 28.90217,-20.89301 40.53035,-34.31292c23.35718,-26.95617 38.11014,-56.84929 47.58521,-91.10149c8.58871,-31.04801 19.66958,-63.43887 20.22977,-95.92251c0.32301,-18.73027 -3.91758,-36.92135 -8.41943,-54.97947c-6.84848,-27.47106 -15.08414,-53.48186 -28.8769,-78.28159c-22.0345,-38.53786 -54.43501,-62.6141 -92.88847,-83.06743c-19.29707,-10.26408 -39.14512,-19.31789 -60.11386,-25.62034c-77.43435,-23.27397 -160.72558,-16.85405 -237.37394,5.64703c-30.05634,8.82341 -60.10793,17.69968 -87.82243,32.57894c-28.54141,16.13306 -51.88537,42.33313 -64.50014,72.736c-6.55837,15.80634 -9.73138,32.88735 -12.86938,49.63481c-11.82728,63.12184 -6.28298,132.83001 27.42877,188.78713c10.70951,17.77639 24.85618,33.08928 39.5638,47.60081c26.47956,25.28125 56.81307,44.14613 90.41258,58.43633c26.13624,11.116 50.74948,18.4471 79.42077,17.92221" id="Path 1" stroke-width="3"/><path className="out-top" fill="#874000" d="M533,299c-44.01551,8.68708 -98.09369,16.70068 -128.44876,53.64365c-20.44186,24.87832 -27.86318,57.98926 -29.95831,89.40699c-3.57506,53.61023 9.62882,104.54409 38.67595,149.85301c17.85689,27.85392 41.15525,53.01168 72.50564,65.4147c63.08517,24.95813 133.4729,6.96777 188.00619,-29.33451c19.83918,-13.20675 38.76639,-29.72478 50.66311,-50.69642c18.95053,-33.40615 21.92865,-73.68143 12.3922,-110.3765c-11.43908,-36.19952 -33.98601,-65.76701 -60.1857,-92.66489c-24.68039,-25.33809 -52.88279,-51.66281 -86.29158,-64.89246c-20.76937,-8.22453 -43.22721,-10.93934 -65.41943,-11.51601" id="Path 1" stroke-width="3"/><path className="in-bottom" fill="#F4442E" d="M1221,738c-29.67027,-3.88808 -61.06056,-9.82651 -91.1451,-7.75978c-26.36342,1.8111 -52.39564,7.01262 -77.35212,15.69277c-9.63546,3.35132 -20.01773,7.08866 -28.84723,12.33861c-26.02052,15.47159 -43.99289,37.44937 -61.9078,61.04185c-16.2435,21.39137 -33.80563,42.38622 -44.69478,67.19931c-13.4821,30.72165 -18.46788,64.83642 -23.33346,97.80011c-5.87527,39.80425 -10.4388,78.02576 4.10091,116.65972c8.53509,22.67888 22.22131,42.31793 37.61321,60.82023c25.65086,30.8344 56.1183,57.80958 89.61401,79.87935c66.32077,39.81625 146.07354,59.97228 222.97224,63.28983c28.42646,1.22637 59.01503,2.5757 86.88877,-4.762c17.86278,-4.70234 34.27835,-13.31633 50.50955,-21.92507c23.10997,-12.25713 45.70417,-25.02846 64.55503,-43.43069c40.71607,-39.7471 66.02477,-90.1139 80.02588,-144.76021c16.11121,-62.882 17.01121,-129.13402 -6.19708,-190.32388c-16.17747,-39.32886 -42.47683,-72.79217 -79.91813,-94.12642c-25.1267,-14.31733 -54.06355,-23.239 -81.50579,-31.95265c-51.82012,-16.45428 -104.36381,-27.66605 -157.82487,-37.06906" id="Path 1" stroke-width="3"/><path className="out-bottom" fill="#BC5F04" d="M1216,799c-47.13046,0 -97.30702,-3.793 -139.94587,20.39986c-17.77204,10.08368 -34.96261,23.59165 -47.09779,40.1945c-12.63598,17.28802 -19.72193,38.29628 -25.80434,58.60726c-7.34036,24.51169 -13.0318,49.31957 -15.09505,74.87342c-3.15919,39.12744 -0.90635,76.25164 23.34388,108.99173c25.55102,34.49628 63.37274,56.85926 102.26187,73.36713c66.74876,28.33387 142.46795,39.40437 208.44658,2.95859c33.28582,-18.38668 57.06738,-47.73019 75.50677,-80.3741c17.79186,-31.49755 29.97975,-64.11851 34.01979,-100.11979c1.9398,-22.96717 0.74586,-44.83135 -4.93623,-67.2489c-4.56078,-17.99364 -11.54632,-35.30563 -21.09806,-51.22727c-6.72818,-11.2151 -15.08362,-21.61402 -24.04174,-31.11822c-11.69074,-12.4034 -25.02093,-24.104 -40.29676,-31.91919c-37.5535,-19.21257 -84.07072,-16.90857 -125.26307,-17.38503z" id="Path 1" stroke-width="3"/><path d="M525,483.36462v-32.36462h33.06461v32.36462z" id="Path 1" stroke-width="1"/><path d="M1173,1000.13482v-52.13482h36.71704v52.13482z" id="Path 1" stroke-width="1"/></svg>
            */}
            <section className="slide">
                <div>
                <h2 className="slide-word slide-word-top slide-word-warm d-inline-block" data-animation="slide">25</h2><h2 className="slide-word slide-word-top slide-word-cool d-inline-block" data-animation="slide"> Words</h2>
                </div>
                <h2 className="slide-word slide-word-bottom slide-word-neutral slide-word-small" data-animation="slide">Or Less</h2>
            </section>
            <FlexBox classes={'flex-wrap justify-content-around index-page-buttons-container text-center'}>
                <IndexPageButton onClick={clickedQueue} wrapperClass={''} buttonClass={'queue-button'} buttonText={'Quick play'} icon={solid("play")} />
                {/*<IndexPageButton onClick={clickedCustomLobbies} wrapperClass={''} buttonClass={'lobbies-button'} buttonText={'Custom lobbies'} icon={solid("people-group")} />
                <IndexPageButton onClick={clickedSpectate} wrapperClass={''} buttonClass={'spectate-button'} buttonText={'Spectate'} icon={solid("eye")} /> */}
        </FlexBox>
            <FlexBox classes="update-name justify-content-center gap-2">
                <input
                    type="text"
                    className="update-name-input rounded"
                    id="update-name-input"
                    placeholder={getAccount().username}
                    maxLength={16}
                    minLength={3}
                    onChange={(event) => setName(event.target.value)}
                />
                <FlexBox classes={"name-valid-container align-items-center" + (validName ? " name-valid-container-valid" : " name-valid-container-invalid")}>
                    <FontAwesomeIcon icon={validName ? solid("check") : solid("times")} className="name-valid-icon rounded-circle" />
                </FlexBox>
            </FlexBox>
           </div>
    )
}

interface IndexPageButtonProps {
    onClick: Function;
    wrapperClass: string;
    buttonClass: string;
    buttonText: string;
    icon: IconDefinition
}

function IndexPageButton(props: IndexPageButtonProps) {
    return (
        <div>
            <div className={props.wrapperClass + " big-action-button-container"}>
                <button type="button" className={props.buttonClass + " big-action-button"} onClick={() => {props.onClick()}}><FontAwesomeIcon icon={props.icon} /> {" " + props.buttonText}</button>
            </div>
        </div>
    )
}

