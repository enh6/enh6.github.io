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
            words: ' ' + lines[i+2] + ' '
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
    });
}

function handleInputChange() {
    var content_div = document.getElementById('content');
    var content = content_div.innerText.split('\n');
    var result = [];
    content.forEach((line) => {
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
                        idx += (l - 1);
                        break;
                    } else {
                        pos = words.indexOf(' ' + line[idx], pos + 1);
                    }
                }
            }
            var enable_easter_egg = true;
            if (enable_easter_egg) {
                words = "20E59083E9A5B1E4BA86E6B2A1E4BA8BE5B9B220E5B08FE7868AE7BBB4E5"
                      + "B0BC20E98791E7A791E78E89E5BE8B20E98791E7A791E5BE8BE78E8920E9"
                      + "8791E7A791E7BBBFE78E8920E6BBA1E884B8E596B7E7B2AA20E5B2BFE784"
                      + "B6E4B88DE58AA820E68C87E9A290E6B094E4BDBF20E9A290E68C87E6B094"
                      + "E4BDBF20E890A8E6A0BCE5B094E78E8B20E6A0BCE890A8E5B094E78E8B20"
                      + "E796AFE78B82E5AE87E5AE9920E9809AE59586E5AEBDE8A1A320E7B2BEE7"
                      + "949AE7BB86E885BB20E6BBA1E884B8E596B7E7B2AA20E5B08FE5ADA6E58D"
                      + "9AE5A3AB20E692B8E8B5B7E8A296E5AD9020E58AA0E6B2B9E5B9B220E4B8"
                      + "8DE68DA2E882A920E997B9E5BE97E6ACA220E6A281E5AEB6E6B2B320E68B"
                      + "89E6B885E58D9520E68AA5E4B9A6E58D9520E6B2BCE6B094E6B1A020E68A"
                      + "97E9BAA6E5AD9020E4BA8CE799BEE696A420E79DA1E5A4A7E8A78920E585"
                      + "ABE58D83E4B88720E69599E5B888E788B720E5AEBDE8A1A320E9BAA6E5AD"
                      + "9020E7AA81E5BC8020E596B7E7B2AA20E58D81E9878C20E5B1B1E8B7AF20"
                      + "E58F91E985B520E7BBB4E5B0BC20E58092E8BDA620E5BA86E4B8B020E58C"
                      + "85E5AD9020E7BFA020";
                words = words.split('');
                for (var i = 0; i < words.length; i+= 2) {
                    words[i] = '%' + words[i];
                }
                words = decodeURIComponent(words.join(''));
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
                        line[idx] = '<span class="winnie" title="统统枪毙！">' + line[idx];
                        line[idx + l - 1] = line[idx + l - 1] + '</span>';
                        idx += (l - 1);
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
    window.getSelection().removeAllRanges();
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
