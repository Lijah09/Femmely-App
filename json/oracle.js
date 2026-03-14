const triviaData = [];
let triviaIndex = 0;

fetchTrivia();

async function fetchTrivia() {
    const response = await fetch("json/oracle.json");
    const data = await response.json();
    
    triviaData.push(...data.trivia);

    
    console.log("trivia data fetched");
    randomizeTrivia(triviaData);
    triviaLoop();
}

function triviaLoop() {
    if (triviaData.length == 0) return;

    displayTrivia();

    setInterval(displayTrivia, 2000);
    console.log("trivia loop started");
}

function displayTrivia() {
    let oracleID;
    const oracleTitle = document.querySelector(".oracle-title");
    const oracleText = document.querySelector(".oracle-preview");
    const oracleLink = document.querySelector(".oracle-link");
    const oracleTag = document.querySelector(".oracle-tag");
    
    const currentTrivia = triviaData[triviaIndex];

    oracleID = currentTrivia.id;
    oracleTitle.innerText = currentTrivia.title;
    oracleText.innerText = currentTrivia.text;
    oracleLink.href = currentTrivia.link;
    oracleTag.innerText = currentTrivia.tag;
    triviaIndex = (triviaIndex + 1) % triviaData.length;
}

function randomizeTrivia(array) {
    console.log("randomizing trivia");
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
        console.log("trivia #" + array[i].id)
    }
}