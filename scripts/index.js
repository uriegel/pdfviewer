import '../pdfviewer.js'

const pdfViewer = document.querySelector('pdf-viewer')
const showPdf = document.getElementById("visible")
showPdf.onchange = () => {
    if (showPdf.checked) {
        pdfViewer.classList.remove("displayNone")
        pdfViewer.load("getpdf?path=/home/uwe/e.pdf")
    }
    else 
        pdfViewer.classList.add("displayNone")
}
