/* Get the submission details url from the submission page. */
//var submissionURL = "https://leetcode.com/submissions/detail/698605622/";
console.log("hello this text is from my own developed chrome extension <3 ")

if (submissionURL != undefined) {
    /* Request for the submission details page */
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            /* received submission details as html reponse. */
            var doc = new DOMParser().parseFromString(
                this.responseText,
                'text/html',
            );
            /* the response has a js object called pageData. */
            /* Pagedata has the details data with code about that submission */
            var scripts = doc.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                var text = scripts[i].innerText;
                if (text.includes('pageData')) {
                    /* Considering the pageData as text and extract the substring
                    which has the full code */
                    var firstIndex = text.indexOf('submissionCode');
                    var lastIndex = text.indexOf('editCodeUrl');
                    var slicedText = text.slice(firstIndex, lastIndex);
                    /* slicedText has code as like as. (submissionCode: 'Details code'). */
                    /* So finding the index of first and last single inverted coma. */
                    var firstInverted = slicedText.indexOf("'");
                    var lastInverted = slicedText.lastIndexOf("'");
                    /* Extract only the code */
                    var codeUnicoded = slicedText.slice(
                        firstInverted + 1,
                        lastInverted,
                    );
                    /* The code has some unicode. Replacing all unicode with actual characters */
                    var code = codeUnicoded.replace(
                        /\\u[\dA-F]{4}/gi,
                        function (match) {
                            return String.fromCharCode(
                                parseInt(match.replace(/\\u/g, ''), 16),
                            );
                        },
                    );

                    console.log("Your leetcode submitted code is given below: ")
                    console.log(".................................................")
                    console.log(code)
                    console.log(".................................................")
                    console.log("your 70% works is done! go ahead !")

                }
            }
        }
    };
    xhttp.open('GET', submissionURL, true);
    xhttp.send();
}