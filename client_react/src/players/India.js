import Batsman from "./Batsman";

let b1 = Object.assign({}, Batsman);
let b2 = Object.assign({}, Batsman);

b1.index = 0;
b1.firstName = "KL";
b1.lastName = "Rahul";
b1.rightHanded = true;
b1.fourVideo = "videos/Four/India/KL Rahul.mp4";
b1.sixVideo = "videos/Six/India/KL Rahul.mp4";
b1.outVideo = "videos/Out/India/KL Rahul.mp4";
b1.fourVideoDuration = 9;
b1.sixVideoDuration = 6;
b1.outVideoDuration = 12;

b2.index = 1;
b2.firstName = "Rohit";
b2.lastName = "Sharma";
b2.rightHanded = true;
b2.fourVideo = "videos/Four/India/Rohit Sharma.mp4";
b2.fourVideoDuration = 6;
b2.sixVideoDuration = 6;
b2.outVideoDuration = 28;
b2.sixVideo = "videos/Six/India/Rohit Sharma.mp4";

const IndianPlayers = [b1, b2];

export default IndianPlayers;
