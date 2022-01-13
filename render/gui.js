window.onload = function () {

    $("#codeInput").on("keyup", function () {
        mdParser()
    });

    $("#Save").on("click", function () {
        window.api.send("save-file", $("#codeInput").val());
    });

    $("#Open").on("click", function () {
        window.api.send("open-file", "");
    });
    $("#Dictate").on("click", function () { alert("Dictate"); });
    $("#OCR").on("click", function () { alert("OCR"); });
    $("#Read").on("click", function () { alert("Read"); });
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
        if (event.ctrlKey && event.key == "s") {
            window.api.send("save-file", $("#codeInput").val());
        }
        if (event.ctrlKey && event.key == "o") {
            window.api.send("open-file", "");

            // window.api.send("save-file", $("#codeInput").val());
        }
    });

    window.api.receive("new-file", (data) => {
        $("#codeInput").val(data);
        mdParser()
    });
};

function mdParser(){
     // console.log($("#codeInput").val());
     let parsedHTML = DOMPurify.sanitize(marked.parse($("#codeInput").val()));
     $("#outputText").html(parsedHTML);
     $("input[type='checkbox']").parents("ul").css({ "list-style-type": "none" });
}