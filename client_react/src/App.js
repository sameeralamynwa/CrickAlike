import "./App.css";
import ReactPlayer from "react-player";
import React, { useState, useEffect } from "react";
import IndianPlayers from "./players/India";



function App() {
    const [url, setUrl] = useState("videos/CutScene1.mp4");
    const [runs, setRuns] = useState(0);
    const [wicket, setWicket] = useState(0);

    const [bowlStatus, setBowlStatus] = useState(-1);

    const [overNumber, setOverNumber] = useState(0);
    const [bowlNumber, setBowlNumber] = useState(0);

    const [currentStrike, setCurrentStrike] = useState(0);

    const [batsmanDashBoard, setBatsmanDashboard] = useState(IndianPlayers);

    const [players, setPlayers] = useState(IndianPlayers);

    const totalOver = 5;

    const [flag, setFlag] = useState(true);

    const [marqueeText, setMarqueeText] = useState("-1");
    const [marqueeVisible, setMarqueeVisible] = useState(false);

    useEffect(() => {
        setFlag(false);
    });

    useEffect(() => {
        if (flag) return;
        if (bowlStatus === 4) {
            setMarqueeVisible(false);
            setRuns(runs + 4);
            setUrl(
                "videos/Four/India/" +
                    players[currentStrike].firstName +
                    " " +
                    players[currentStrike].lastName +
                    ".mp4"
            );
            setMarqueeText(
                players[currentStrike].firstName +
                    " " +
                    players[currentStrike].lastName +
                    " hit 4 runs in lastBall"
            );
            setTimeout(() => {
                setUrl("videos/BowlingWarmup.mp4");
                setMarqueeVisible(true);
            }, players[currentStrike].fourVideoDuration * 1000);
        } else if (bowlStatus === 1) {
            setMarqueeVisible(false);
            setRuns(runs + 1);
            setCurrentStrike((currentStrike + 1) % 2);
            setMarqueeText(
                players[currentStrike].firstName +
                    " " +
                    players[currentStrike].lastName +
                    " hit 1 run in lastBall"
            );
            setUrl(
                "videos/Four/India/" +
                    players[currentStrike].firstName +
                    " " +
                    players[currentStrike].lastName +
                    ".mp4"
            );
            setTimeout(() => {
                setUrl("videos/BowlingWarmup.mp4");
                setMarqueeVisible(true);
            }, players[currentStrike].fourVideoDuration * 1000);
        } else if (bowlStatus === 6) {
            setMarqueeVisible(false);
            setRuns(runs + 6);
            setMarqueeText(
                players[currentStrike].firstName +
                    " " +
                    players[currentStrike].lastName +
                    " hit 6 runs in lastBall"
            );
            setUrl(
                "videos/Six/India/" +
                    players[currentStrike].firstName +
                    " " +
                    players[currentStrike].lastName +
                    ".mp4"
            );
            setTimeout(() => {
                setUrl("videos/BowlingWarmup.mp4");
                setMarqueeVisible(true);
            }, players[currentStrike].sixVideoDuration * 1000);
        }
    }, [players]);

    useEffect(() => {
        setBowlNumber((bowlNumber + 1) % 6);
    }, [runs]);

    useEffect(() => {
        if (bowlNumber == 0) {
            setOverNumber(overNumber + 1);
        }
    }, [bowlNumber]);

    function playOne() {
        setBowlStatus(1);
        let b1 = [...players];
        b1[currentStrike].runs += 1;
        b1[currentStrike].bowls += 1;
        setPlayers(b1);
        console.log(b1);
    }

    function playSix() {
        setBowlStatus(6);
        let b1 = [...players];
        b1[currentStrike].runs += 6;
        b1[currentStrike].bowls += 1;
        setPlayers(b1);
    }

    function playFour() {
        setBowlStatus(4);
        let b1 = [...players];
        b1[currentStrike].runs += 4;
        b1[currentStrike].bowls += 1;
        setPlayers(b1);
        // setRuns(runs + 4);
    }

    return (
        <div>
            <div className="video-container">
                <ReactPlayer
                    url={url}
                    width="100%"
                    height="100%"
                    playing={true}
                    muted={true}
                    // controls={true}
                ></ReactPlayer>
            </div>
            <div
                className="scorecard1"
                style={marqueeVisible == false ? { display: "none" } : {}}
            >
                <div id="scroll-text">{marqueeText}</div>
            </div>
            <div className="scorecard">
                <div className="scorecard-team-info">IND</div>
                <div className="scorecard-scorecard">
                    <div className="scorecard-team-score">{runs}</div>
                    <div className="scorecard-team-score-separator">-</div>
                    <div className="scorecard-team-wickets">{wicket}</div>
                </div>
                <div className="scorecard-over-card">
                    <div className="scorecard-team-currentOver">
                        {overNumber}.{bowlNumber}
                    </div>
                    <div className="scorecard-team-totalOver">
                        ({totalOver})
                    </div>
                </div>
                <div className="batsman-container">
                    <div className="batsman-info">
                        <div className="batsman-firstName">
                            {players[0].firstName}
                        </div>
                        <div className="batsman-lastName">
                            {players[0].lastName}
                        </div>
                        <div
                            className="batsman-strike"
                            style={{
                                display: currentStrike == 0 ? "block" : "none",
                            }}
                        >
                            *
                        </div>
                        <div className="batsman-score-separator">-</div>
                        <div className="batsman-runs">{players[0].runs}</div>
                        <div className="batsman-bowls">
                            <span className="bowls-bracket">(</span>
                            {players[0].bowls}
                            <span className="bowls-bracket">)</span>
                        </div>
                    </div>
                    <div className="batsman-info">
                        <div className="batsman-firstName">
                            {players[1].firstName}
                        </div>
                        <div className="batsman-lastName">
                            {players[1].lastName}
                        </div>
                        <div
                            className="batsman-strike"
                            style={{
                                display: currentStrike == 1 ? "block" : "none",
                            }}
                        >
                            *
                        </div>
                        <div className="batsman-score-separator">-</div>
                        <div className="batsman-runs">{players[1].runs}</div>
                        <div className="batsman-bowls">
                            <span className="bowls-bracket">(</span>
                            {players[1].bowls}
                            <span className="bowls-bracket">)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="simulated-container">
                {/* <div className="button-out-container"> Out </div> */}
                <div className="button-container" onClick={() => playOne()}>
                    {" "}
                    One{" "}
                </div>
                <div className="button-container"> Two </div>
                <div
                    className="button-container"
                    onClick={() => {
                        playFour();
                    }}
                >
                    Four
                </div>
                <div className="button-container" onClick={() => playSix()}>
                    {" "}
                    Six{" "}
                </div>
            </div>
        </div>
    );
}

export default App;
