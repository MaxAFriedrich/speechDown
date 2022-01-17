const playPaused = false;
let progressBarUse = 0;
window.onload = function () {
    $("#codeInput").focus();
    $("#codeInput").on("keyup", function () {
        mdParser();
    });

    $("#Save").on("click", function () {
        window.api.send("save-file", $("#codeInput").val());
    });

    $("#Open").on("click", function () {
        window.api.send("open-file", "");
    });
    $("#New").on("click", function () {
        window.api.send("create-file", "");
        $("#codeInput").val("");
        mdParser();
    });

    $("#settingsBtn").on("click", () => {

        $("#settingsModal").slideDown("medium");
        $(".modal-block").fadeIn("medium");
    });
    $("#darkMode").on("click", () => {
        $("#themeCSS").attr("href", "dark.css");
        $("#lightMode").toggle();
        $("#darkMode").toggle();
        window.api.send("set-theme", "dark");
    });
    $("#lightMode").on("click", () => {
        $("#themeCSS").attr("href", "light.css");
        $("#lightMode").toggle();
        $("#darkMode").toggle();
        window.api.send("set-theme", "light");
    });

    $("#speechSpeed").on("change", () => {
        window.api.send("set-speechSpeed", Number($("#speechSpeed").val()));
        $("#speechSpeedDisplay").text($("#speechSpeed").val());
    });
    $("#openAuthFile").on("click", () => {
        window.api.send("auth-location", "");
    });

    $("#Dictate").on("click", function () {
        window.api.send("toggle-dictate", "");
        $("#dictationOn").toggle();
        $("#dictationOff").toggle();
        progressBar("#dictationOn");

    });
    $("#OCR").on("click", function () {
        window.api.send("start-ocr", "");
        progressBar("#OCR");
    });
    $("#Read").on("click", function () {
        readText();
        progressBar("#speakOn");
    });
    $("#Code").on("click", function () {
        $("#codeInput").show();
        $("#codeInput").focus();
        $("#outputText").hide();
    });
    $("#Both").on("click", function () {
        $("#codeInput").show();
        $("#codeInput").focus();
        $("#outputText").show();
    });
    $("#Preview").on("click", function () {
        $("#codeInput").hide();
        $("#outputText").show();
    });

    $(".modal-close").on("click", () => {
        $(".modal-wrapper").slideUp("medium");
        $(".modal-block").fadeOut("medium");
    });
    $(".modal-block").on("click", () => {
        $(".modal-wrapper").slideUp("medium");
        $(".modal-block").fadeOut("medium");
    });


    HTMLTextAreaElement.prototype.getCaretPosition = function () { //return the caret position of the textarea
        return this.selectionStart;
    };
    HTMLTextAreaElement.prototype.setCaretPosition = function (position) { //change the caret position of the textarea
        this.selectionStart = position;
        this.selectionEnd = position;
        this.focus();
    };
    HTMLTextAreaElement.prototype.hasSelection = function () { //if the textarea has selection then return true
        if (this.selectionStart == this.selectionEnd) {
            return false;
        } else {
            return true;
        }
    };
    HTMLTextAreaElement.prototype.getSelectedText = function () { //return the selection text
        return this.value.substring(this.selectionStart, this.selectionEnd);
    };
    HTMLTextAreaElement.prototype.setSelection = function (start, end) { //change the selection area of the textarea
        this.selectionStart = start;
        this.selectionEnd = end;
        this.focus();
    };

    var textarea = document.getElementById("codeInput");

    textarea.onkeydown = function (event) {

        //support tab on textarea
        if (event.key == "Tab") { //tab was pressed
            var newCaretPosition;
            newCaretPosition = textarea.getCaretPosition() + "    ".length;
            textarea.value = textarea.value.substring(0, textarea.getCaretPosition()) + "    " + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
            textarea.setCaretPosition(newCaretPosition);
            return false;
        }
        if (event.key == "Backspace") { //backspace
            if (textarea.value.substring(textarea.getCaretPosition() - 4, textarea.getCaretPosition()) == "    ") { //it's a tab space
                var newCaretPosition;
                newCaretPosition = textarea.getCaretPosition() - 3;
                textarea.value = textarea.value.substring(0, textarea.getCaretPosition() - 3) + textarea.value.substring(textarea.getCaretPosition(), textarea.value.length);
                textarea.setCaretPosition(newCaretPosition);
            }
        }
        if (event.key == "LeftArrow") { //left arrow
            var newCaretPosition;
            if (textarea.value.substring(textarea.getCaretPosition() - 4, textarea.getCaretPosition()) == "    ") { //it's a tab space
                newCaretPosition = textarea.getCaretPosition() - 3;
                textarea.setCaretPosition(newCaretPosition);
            }
        }
        if (event.key == "RightArrow") { //right arrow
            var newCaretPosition;
            if (textarea.value.substring(textarea.getCaretPosition() + 4, textarea.getCaretPosition()) == "    ") { //it's a tab space
                newCaretPosition = textarea.getCaretPosition() + 3;
                textarea.setCaretPosition(newCaretPosition);
            }
        }
    };

    $("body").on("keydown", function (event) {
        if (event.ctrlKey && event.key == "s") {
            window.api.send("save-file", $("#codeInput").val());
        }
        if (event.ctrlKey && event.key == "o") {
            // window.api.send("save-file", $("#codeInput").val());
            window.api.send("open-file", "");
        }
        if (event.ctrlKey && event.key == "n") {
            window.api.send("create-file", "");
            $("#codeInput").val("");
            mdParser();
        }
        if (event.ctrlKey && event.key == ",") {
            $("#settingsModal").slideToggle("medium");
            $(".modal-block").fadeToggle("medium");
        }
        if (event.key == "Escape" && $(".modal-wrapper").is(":visible")) {
            $(".modal-wrapper").slideUp("medium");
            $(".modal-block").fadeOut("medium");
        }
        if (event.ctrlKey && event.key == "d") {
            window.api.send("toggle-dictate", "");
            $("#dictationOn").toggle();
            $("#dictationOff").toggle();
            progressBar("#dictationOn");

        }
        if (event.ctrlKey && event.key == "e") {
            window.api.send("start-ocr", "");
            progressBar("#OCR");
        }
        if (event.ctrlKey && event.key == "r") {
            readText();
            progressBar("#speakOn");

            // $("#speakOn").toggle();
            // $("#speakOff").toggle();
        }
        if (event.ctrlKey && event.key == "1") {
            $("#codeInput").show();
            $("#codeInput").focus();
            $("#outputText").hide();
        }
        if (event.ctrlKey && event.key == "2") {
            $("#codeInput").show();
            $("#codeInput").focus();
            $("#outputText").show();
        }
        if (event.ctrlKey && event.key == "3") {
            $("#codeInput").hide();
            $("#outputText").show();
        }
    });

    window.api.receive("new-file", (data) => {
        $("#codeInput").val(data);
        mdParser();
    });
    window.api.receive("current-theme", (data) => {
        if (data == "dark") {
            $("#darkMode").hide();
            $("#themeCSS").attr("href", "dark.css");
        }
        else {
            $("#lightMode").hide();
            $("#themeCSS").attr("href", "light.css");
        }
    });
    window.api.send("get-theme", "");
    window.api.receive("current-speechSpeed", (data) => {
        $("#speechSpeed").val(data);
        $("#speechSpeedDisplay").text(data);
    });
    window.api.send("get-speechSpeed", "");
    window.api.receive("text-dictate", (data) => {
        if (data.text != "" && data.text != "the") {
            // console.log(data);
            $("#codeInput").focus();
            insertText(data.text);
            mdParser();
        }
    });
    window.api.receive("result-ocr", (text) => {
        var input = document.getElementById("codeInput");

        if (input == undefined) { return; }
        var scrollPos = input.scrollTop;
        var pos = 0;
        var browser = ((input.selectionStart || input.selectionStart == "0") ?
            "ff" : (document.selection ? "ie" : false));
        if (browser == "ie") {
            input.focus();
            var range = document.selection.createRange();
            range.moveStart("character", -input.value.length);
            pos = range.text.length;
        }
        else if (browser == "ff") { pos = input.selectionStart; };

        var front = (input.value).substring(0, pos);
        var back = (input.value).substring(pos, input.value.length);
        input.value = front + text + back;
        pos = pos + text.length;
        if (browser == "ie") {
            input.focus();
            var range = document.selection.createRange();
            range.moveStart("character", -input.value.length);
            range.moveStart("character", pos);
            range.moveEnd("character", 0);
            range.select();
        }
        else if (browser == "ff") {
            input.selectionStart = pos;
            input.selectionEnd = pos;
            input.focus();
        }
        input.scrollTop = scrollPos;
        mdParser();
        progressBar("script");
    });
    window.api.receive("fail-ocr", (data) => {
        progressBar("script");
    });
    window.api.receive("audio-speak", (data) => {
        var audio = document.getElementById("speakingAudio");
        audio.src = data;
        audio.controls = true;
        document.body.appendChild(audio);
        audio.play();
        playPaused = true;
        // $("#speakOn").toggle();
        // $("#speakOff").toggle();
    });
    $("#speakingAudio").on("ended", () => {
        $("#speakOn").toggle();
        $("#speakOff").toggle();
        progressBar("#speakOn");
        playPaused = false;
    });
};

function readText() {
    if (playPaused) {
        var audio = document.getElementById("speakingAudio");
        audio.play();
        $("#speakOn").toggle();
        $("#speakOff").toggle();
        return;
    } else if ($("#speakOff").is(":visible")) {
        var textComponent = document.getElementById('codeInput');
        var selectedText;

        if (textComponent.selectionStart !== undefined) {// Standards Compliant Version
            var startPos = textComponent.selectionStart;
            var endPos = textComponent.selectionEnd;
            selectedText = textComponent.value.substring(startPos, endPos);
        }
        else if (document.selection !== undefined) {// IE Version
            textComponent.focus();
            var sel = document.selection.createRange();
            selectedText = sel.text;
        }
        window.api.send("start-speak", selectedText);
    } else {
        var audio = document.getElementById("speakingAudio");
        audio.pause();
    }
    $("#speakOn").toggle();
    $("#speakOff").toggle();
}
function mdParser() {
    // console.log($("#codeInput").val());
    let parsedHTML = DOMPurify.sanitize(marked.parse($("#codeInput").val()));
    $("#outputText").html(parsedHTML);
    $("input[type='checkbox']").parents("ul").css({ "list-style-type": "none" });
    $("#outputText a").on("click", function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.api.send("open-link", $(this).attr("href"));
    });
}


function isLetter(str) {
    return str.length === 1 && str.match(/[a-z]/i);
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

/*

TODO

? - [x] End sentence punctuation - **in text**
? - [x] End sentence punctuation - **with old text**
? - [x] mid sentence punctuation
? - [ ] new lines and new paragraphs
? - [x] speech marks and brackets
? - [x] "I" and "I'm" by itself

*/

function insertText(text) {
    var input = document.getElementById("codeInput");

    if (input == undefined) { return; }
    var scrollPos = input.scrollTop;
    var pos = 0;
    var browser = ((input.selectionStart || input.selectionStart == "0") ?
        "ff" : (document.selection ? "ie" : false));
    if (browser == "ie") {
        input.focus();
        var range = document.selection.createRange();
        range.moveStart("character", -input.value.length);
        pos = range.text.length;
    }
    else if (browser == "ff") { pos = input.selectionStart; };

    var front = (input.value).substring(0, pos);
    var back = (input.value).substring(pos, input.value.length);

    const allCharacters = [
        [" I ", [" i "]],
        ["i'm", ["I'm"]],
        [".", [" full stop", " period", "dot"]],
        ["!", [" exclamation mark"]],
        ['"', ["speech mark", "quotation mark"]],
        ["£", ["great british pounds ", "british pounds ", "pounds ", "pound sign ", "pound symbol "]],
        ["$", ["dollars ", "dollar sign ", "dollar "]],
        ["%", ["percent ", "percent symbol "]],
        ["^", ["carrot symbol", "carrot sign"]],
        ["&", ["ampersand"]],
        ["*", ["star symbol", "star sign", "asterisk", "italics"]],
        ["**", ["bold"]],
        ["(", ["open bracket ", "open brackets ", "start brackets ", "start bracket "]],
        [")", [" close bracket", " close brackets", " end brackets", " end bracket"]],
        ["- ", ["dash symbol ", "dash sign "]],
        ["_", [" underscore ", " underscore symbol ", " underscore sign "]],
        ["+", ["plus sign", "plus symbol", "add symbol", "add sign"]],
        ["=", ["equals", "equals symbol", "equals sign"]],
        ["`", ["grave accent", "grave symbol", "grave sign"]],
        ["¬", ["logical not symbol", "logical not sign"]],
        ["{", [" open curly brace", " open curly bracket", " open brace", " start curly brace", " start curly bracket", " start brace"]],
        ["}", ["close curly brace ", "close curly bracket ", "close brace ", "end curly brace ", "end curly bracket ", "end brace "]],
        ["[", [" open square bracket", " start square bracket"]],
        ["]", ["close square bracket ", "end square bracket "]],
        [":", [" colon"]],
        [";", [" semi colon"]],
        ["@", [" at symbol "]],
        ["'", ["single quote", "apostrophe"]],
        ["~", ["tilde", "tilde symbol", "tilde sign"]],
        ["#", ["hashtag", "hash tag", "hash symbol", "hash sign"]],
        ["##", ["heading two"]],
        ["###", ["heading three"]],
        ["####", ["heading four"]],
        ["#####", ["heading five"]],
        ["######", ["heading six"]],
        ["|", ["bar symbol", "bar sign"]],
        ["\\", [" back slash "]],
        ["<", ["less than symbol", "less than sign"]],
        ["<", ["greater than symbol", "greater than sign"]],
        [", ", [" half stop ", " comma "]],
        ["/", [" slash ", " forward slash "]],
        ["?", [" question mark"]],
    ];
    text = " " + text + " ";
    for (let i = 0; i < allCharacters.length; i++) {
        for (let j = 0; j < allCharacters[i][1].length; j++) {
            text = text.replace(new RegExp(allCharacters[i][1][j], "g"), allCharacters[i][0]);
        }
    }
    text = text.trim();
    text = text.replace(/(\!|\-|\.|\?|\*|#)( |)(\S)/g, s => s.toUpperCase());
    let lastCharacter = front.trim();
    lastCharacter = front.charAt(lastCharacter.length - 1);
    const endSentencePunctuation = ["!", "-", ".", "?", "*", " \n"];
    let lastCharacterBool = false;
    endSentencePunctuation.forEach((e) => {
        if (e == lastCharacter)
            lastCharacterBool = true;
    });

    if (isLetter(front.charAt(front.length - 1))) {
        text = " " + text;
    } else if (front == "" || lastCharacterBool) {
        text = capitalizeFirstLetter(text);
    }
    if (lastCharacterBool) {
        text = " " + text;
    }


    input.value = front + text + back;
    pos = pos + text.length;
    if (browser == "ie") {
        input.focus();
        var range = document.selection.createRange();
        range.moveStart("character", -input.value.length);
        range.moveStart("character", pos);
        range.moveEnd("character", 0);
        range.select();
    }
    else if (browser == "ff") {
        input.selectionStart = pos;
        input.selectionEnd = pos;
        input.focus();
    }
    input.scrollTop = scrollPos;

    // console.log(back);
    // console.log(text);
    // console.log(front);

}

function progressBar(selector) {
    if ($(selector).is(":visible")) {
        progressBarUse++;
        $("#progressBar").show();
    } else {
        progressBarUse--;
        if (progressBarUse == 0) {
            $("#progressBar").hide();
        }
    }
}