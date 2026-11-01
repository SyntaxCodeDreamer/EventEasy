$htmlPath = "i:\prompt\eventeasy\DOCUMENTATION.html"
$docxPath = "i:\prompt\eventeasy\DOCUMENTATION.docx"

try {
    $word = New-Object -ComObject Word.Application
    $word.Visible = $false
    $doc = $word.Documents.Open($htmlPath)
    # Format 16 = wdFormatDocumentDefault (.docx)
    $doc.SaveAs([ref]$docxPath, [ref]16)
    $doc.Close()
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    Write-Output "SUCCESS: DOCUMENTATION.docx created successfully via Microsoft Word COM."
} catch {
    Write-Output "NOTE: Open DOCUMENTATION.html in Microsoft Word or browser, then click 'Save As -> Word Document (.docx)'."
}

