var wordlists = [];

// first line: name
// second line: description
// third line: wordlist seperated by space
// fourth line: empty
function processWordlist(text) {
    let lines = text.split('\n');
    for (var i = 0; i < lines.length; i += 4) {
        wordlists.push({
            name: lines[i],
            description: lines[i+1],
            words: ' ' + lines[i+2]
        });
    }
}

function showLegend() {
    var legend_div = document.getElementById('legend');
    wordlists.forEach((wordlist, idx) => {
        var div = document.createElement('span');
        div.classList.add('cat');
        div.classList.add('cat' + idx);
        div.title = wordlist.description;
        div.innerText = wordlist.name;
        legend_div.appendChild(div);
        console.log(wordlist);
    });
}

function handleInputChange() {
    var content_div = document.getElementById('content');
    console.log(content_div.innerText);
    var content = content_div.innerText.split('\n');
    var result = [];
    content.forEach((line) => {
        console.log(line);
        line = line.split('');
        for (var idx = 0; idx < line.length; idx++) {
            if (line[idx] === ' ') {
                continue;
            }
            for (var i = 0; i < wordlists.length; i++) {
                words = wordlists[i].words;
                var pos = words.indexOf(' ' + line[idx]);
                while (pos != -1) {
                    pos += 1;
                    // current character in wordlist
                    var match = true;
                    var l;
                    for (l = 1; words[pos + l] !== ' '; l++) {
                        if (line[idx + l] !== words[pos + l]) {
                            match = false;
                            break;
                        }
                    }
                    if (match) {
                        line[idx] = '<span class="cat' + i + '" title="' + wordlists[i].name + '">' + line[idx];
                        line[idx + l - 1] = line[idx + l - 1] + '</span>';
                        idx += l;
                        break;
                    } else {
                        pos = words.indexOf(' ' + line[idx], pos + 1);
                    }
                }
            }
        }
        result.push(line.join(''));
    });
    content_div.innerHTML = result.join('<br>');
}

fetch('wordlist.txt')
.then((response) => {
    return response.text();
})
.then((text) => {
    processWordlist(text);
    showLegend();
});

document.getElementById('content').addEventListener('input', handleInputChange);

function removePlaceholder() {
    document.getElementById('content').innerText = '';
    document.getElementById('content').removeEventListener('focus', removePlaceholder);
}
document.getElementById('content').addEventListener('focus', removePlaceholder);
