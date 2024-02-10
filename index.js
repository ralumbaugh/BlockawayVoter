const puppeteer = require('puppeteer');

// initialize variables
let totalCount = 0, successes = 0, failures = 0, totalVotes = 0; let wrestleVotes = 0;

initialize();

function initialize() {
    (async() => {
        const browser = await puppeteer.launch({
            executablePath: '/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe',
            headless: false,
            args: [' --incognito', '--tor']
        })
        const pages = await browser.pages();
        const torPage = pages[pages.length-1];

        vote(torPage);
    })();
}

function vote(torPage) {
    (async() => {
        console.log(`Starting a vote attempt!`);
        try {
            await torPage.goto("https://www.blockaway.net/", { timeout: 180000});
            await torPage.waitForSelector("FORM#request INPUT[name='url']");
            await torPage.type("FORM#request INPUT[name='url']", "https://www.heraldnet.com/poll/vote-for-the-heralds-prep-athlete-of-the-week-for-jan-29-feb-4-2/");
            await torPage.click("FORM#request BUTTON");


            // Vote
            
            // Wait a minute for network to load
            await delay(60000);
            await torPage.waitForSelector('label[for=PDI_answer59611178]')
            const element = await torPage.$('label[for=PDI_answer59611178]')
            await element.click()
            await delay(2000)
            await torPage.waitForSelector('#pd-vote-button13311930')
            const submit = await torPage.$('#pd-vote-button13311930')
            await submit.click()
            await torPage.waitForSelector('.pds-answer-text[title="Rikki Miller, Glacier Peak, girls basketball"] + .pds-feedback-result .pds-feedback-votes')
            const currentVotes = await torPage.$eval("SPAN[title='Rikki Miller, Glacier Peak, girls basketball'] ~ SPAN.pds-feedback-result SPAN.pds-feedback-votes", el => el.innerText.match(/([\d,]+)/)[1])
            const currentWrestleVotes = await torPage.$eval("SPAN[title='Malia Ottow, Snohomish, girls wrestling'] ~ SPAN.pds-feedback-result SPAN.pds-feedback-votes", el => el.innerText.match(/([\d,]+)/)[1])
            if(totalVotes === undefined) {
              totalVotes = currentVotes;
              wrestleVotes = currentWrestleVotes;
              console.log('Initiating total votes at ', totalVotes, 'and wrestle votes at ', wrestleVotes);
              console.log('Current Votes', totalVotes, '. Current vote difference', Number(wrestleVotes) - Number(totalVotes));
            }
            else if (totalVotes != currentVotes){
              totalVotes  = currentVotes;
              wrestleVotes = currentWrestleVotes;
              console.log('Current Votes', totalVotes, '. Current vote difference', Number(wrestleVotes.replaceAll(",", "")) - Number(totalVotes.replaceAll(",", "")), " Current time: ", new Date().toLocaleTimeString());
            }
            const voteSuccess = await torPage.$eval("DIV.pds-question-top", el => el.innerText);
            if(voteSuccess == " Thank you for voting! ") {
              successes++;
              console.log('Success! Total successes: ', successes, '. Total failures: ', failures);
            }
            else if(voteSuccess == " Thank you, we have already counted your vote. ") {
              failures++;
              console.log('Failure! Total successes: ', successes, '. Total failures: ', failures);
            }
            count++

            delay(3000);
            browser.close();
            // Go back to blockaway and try again.
            vote();
        }
        catch (error) {
            console.error('error', error);
        };
    })()
}

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds)
    });
}