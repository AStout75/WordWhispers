import { useSelector } from "react-redux";
import { GameRole } from "../../shared-types/game-types";
import { Team, Player, PlayerSpeechAction } from "../../shared-types/lobby-types";
import { selectPlayer } from "../Store/Reducers/playerSlice";
import FlexBox from "./FlexBox";
import wizard from "../Assets/wizard.png";
import knight from "../Assets/knight.png";
import bid from "../Assets/megaphone.png";
import clue from "../Assets/businessman.png";
import hit from "../Assets/approved.png";
import miss from "../Assets/dismissed.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { solid } from "@fortawesome/fontawesome-svg-core/import.macro";

export function TeamPanel(props: {index: number, team: Team, currentTeamIndex: number, deleteTeam: Function}) {
    const empty = props.team.players.length == 0;
    return (
        <FlexBox classes={"flex-column align-items-center " + (empty ? "empty-team " : "") + "team mb-2 " + (props.index == props.currentTeamIndex ? "team-own-team " : "") + "rounded"}>
            <div>
                Team {props.index + 1}
            </div>
            <div className="team-score">
                {props.team.score} points
            </div>
            <FlexBox classes="justify-content-around flex-wrap">
                {props.team.players.map( (player) => {
                    return <Avatar player={player} />
                })}
            </FlexBox>
            {empty && 
                <div className="delete-team-x-button" onClick={() => props.deleteTeam(props.index)}>
                    <FontAwesomeIcon icon={solid("trash")}/>
                </div>
            }
        </FlexBox>
    )
}

export function NewTeamPanel(props: {index: number, addTeam: Function}) {
    
    return (
    <div>
        <FlexBox classes={"flex-column align-items-center new-team rounded mb-2"}>
        <div>
            Add a team
        </div>
        </FlexBox>
    </div>
    )
}

export function Avatar(props: {player: Player}) {
    const ownPlayer = useSelector(selectPlayer);
    let imgSrc = "";
    
    if (props.player.lastAction.action == PlayerSpeechAction.GiveClue) {imgSrc = clue};
    if (props.player.lastAction.action == PlayerSpeechAction.MakeBid) {imgSrc = bid};
    if (props.player.lastAction.action == PlayerSpeechAction.MakeGuessHit) {imgSrc = hit};
    if (props.player.lastAction.action == PlayerSpeechAction.MakeGuessMiss) {imgSrc = miss};
    return (
        <FlexBox classes={"avatar " + (ownPlayer.account.id == props.player.account.id ? "own-avatar rounded " : "") + "flex-column align-items-center justify-content-between"}>
            <div className="avatar-img-container">
                <img src={props.player.role == GameRole.Captain ? wizard : knight} />
                <div className="avatar-speech-bubble-container" key={props.player.lastAction.time} style={imgSrc == "" ? {display: "none"} : {}}>
                    <FlexBox classes="avatar-speech-bubble justify-content-center align-items-center">
                        <div className="avatar-speech-bubble-content">
                            <img src={imgSrc} />
                        </div>
                    </FlexBox>
                </div>
            </div>
            <div className={"text-center m-1 rounded" + (props.player.ready ? " player-ready" : " player-not-ready")}>{props.player.account.username}</div>
            <div className="text-center m-1">{props.player.score} points</div>
        </FlexBox>
    )
}