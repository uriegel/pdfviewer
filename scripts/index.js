import '../pdfviewer.js'

const pdfViewer = document.querySelector('pdf-viewer')
const showPdf = document.getElementById("visible")
showPdf.onchange = () => {
    if (showPdf.checked) 
        pdfViewer.classList.remove("displayNone")
    else
        pdfViewer.classList.add("displayNone")
}
