const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 8080;

const responseTextBase =
    "To elicit a more detailed and specific response from BigStar, you could alter Lilly's prompt as follows:\n\n<prompt>I have $10,000 in savings currently in an investment account. My goal is to earn a passive income of $10,000 per month within the next 6-12 months. Please provide a comprehensive step-by-step plan that outlines clear actions and resources for meeting this goal. The plan should include information on high-yield savings accounts, their interest rates, minimum balance requirements, and any other relevant details. Additionally, please consider providing examples of other investment strategies or financial products that could help me achieve my goal.</prompt>\n\nThis prompt is more detailed and specific, which would encourage BigStar to provide a more thorough response with actionable steps and resources for achieving Lilly's goal";

const responseText = `${responseTextBase}`;

app.use(bodyParser.json());

app.post('/v1/chat/completions', async (req, res) => {
    const parts = chooseBetween(40, 60);
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    countdown(res, parts, parts);
});

const chooseBetween = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

function countdown(res, parts, count) {
    const timeout = chooseBetween(50, 300);

    const chunkSize = Math.ceil(responseText.length / parts);

    res.write(
        'data: ' +
            JSON.stringify({
                choices: [
                    {
                        delta: {
                            content: responseText.slice(
                                (parts - count) * chunkSize,
                                (parts - count + 1) * chunkSize
                            ),
                        },
                    },
                ],
            }) +
            '\n\n'
    );
    if (count) setTimeout(() => countdown(res, parts, count - 1), timeout);
    else res.end();
}

app.post('/embedding', async (req, res) => {
    const dimensions = 5120;
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
    });
    res.write(
        JSON.stringify({
            embedding: new Array(dimensions).fill(0).map(() => Math.random()),
        })
    );
    res.end();
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
