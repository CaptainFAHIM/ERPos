"use client"

import { useState } from "react"
import Barcode from "react-barcode"
import { Button, Card, Label, TextInput, Tooltip, Table } from "flowbite-react"
import { BiBarcodeReader } from "react-icons/bi"
import { FaTrash, FaCog, FaPlus, FaFilePdf, FaList } from "react-icons/fa"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

const BarcodeGenerator = () => {
  const [barcodeData, setBarcodeData] = useState("")
  const [barcodeQuantity, setBarcodeQuantity] = useState(40)
  const [gapSize, setGapSize] = useState(8)
  const [columns, setColumns] = useState(3)
  const [barcodes, setBarcodes] = useState([])
  const [isEditing, setIsEditing] = useState(true)
  const [showList, setShowList] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = () => {
    if (barcodeData) {
      setBarcodes([...barcodes, { code: barcodeData, quantity: Number.parseInt(barcodeQuantity) }])
      setBarcodeData("")
    }
  }

  const handleRemove = (index) => {
    setBarcodes(barcodes.filter((_, i) => i !== index))
  }

  const handleDownloadPDF = async () => {
    setIsGenerating(true)
    try {
      const printArea = document.getElementById("printArea")

      const originalStyle = printArea.style.cssText
      printArea.style.width = "100%"
      printArea.style.maxWidth = "none"
      printArea.style.position = "relative"
      printArea.style.padding = "20px"

      const canvas = await html2canvas(printArea, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
      })

      printArea.style.cssText = originalStyle

      const imgData = canvas.toDataURL("image/jpeg", 1.0)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save("barcodes.pdf")
    } catch (error) {
      console.error("PDF generation failed:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const totalBarcodes = barcodes.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="relative">
          <div className="absolute right-4 top-4 flex gap-2">
            {barcodes.length > 0 && (
              <>
                <Tooltip content="View Barcode List">
                  <Button color="info" size="sm" onClick={() => setShowList(!showList)}>
                    <FaList className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Button gradientDuoTone="purpleToBlue" size="sm" onClick={handleDownloadPDF} disabled={isGenerating}>
                  <FaFilePdf className="mr-2 h-4 w-4" />
                  {isGenerating ? "Generating..." : `PDF (${totalBarcodes})`}
                </Button>
              </>
            )}
            <Tooltip content={isEditing ? "Hide settings" : "Show settings"}>
              <Button gradientDuoTone="cyanToBlue" size="sm" onClick={() => setIsEditing(!isEditing)}>
                <FaCog className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>

          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">Barcode Sheet Generator</h2>
            <p className="mt-2 text-gray-600">Generate and download custom barcode sheets for your inventory</p>
          </div>

          {isEditing && (
            <div className="mt-6 rounded-lg border-2 border-blue-100 bg-white p-6 shadow-lg">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <div className="mb-2">
                    <Label htmlFor="barcodeData" value="Barcode Data" />
                  </div>
                  <div className="flex gap-2">
                    <TextInput
                      id="barcodeData"
                      value={barcodeData}
                      onChange={(e) => setBarcodeData(e.target.value)}
                      placeholder="Enter barcode data"
                      className="flex-1"
                    />
                    <Tooltip content="Add barcode">
                      <Button gradientDuoTone="purpleToBlue" size="sm" onClick={handleGenerate} disabled={!barcodeData}>
                        <FaPlus className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <div>
                  <div className="mb-2">
                    <Label htmlFor="quantity" value="Number of Barcodes" />
                  </div>
                  <TextInput
                    id="quantity"
                    type="number"
                    value={barcodeQuantity}
                    onChange={(e) => setBarcodeQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    min="1"
                  />
                </div>

                <div>
                  <div className="mb-2">
                    <Label htmlFor="columns" value="Columns per Row" />
                  </div>
                  <TextInput
                    id="columns"
                    type="number"
                    value={columns}
                    onChange={(e) => setColumns(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    min="1"
                  />
                </div>

                <div>
                  <div className="mb-2">
                    <Label htmlFor="gap" value="Gap Size (pixels)" />
                  </div>
                  <TextInput
                    id="gap"
                    type="number"
                    value={gapSize}
                    onChange={(e) => setGapSize(Math.max(0, Number.parseInt(e.target.value) || 0))}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {showList && barcodes.length > 0 && (
            <div className="mt-6 rounded-lg border-2 border-blue-100 bg-white shadow-lg">
              <Table>
                <Table.Head>
                  <Table.HeadCell>Barcode</Table.HeadCell>
                  <Table.HeadCell>Quantity</Table.HeadCell>
                  <Table.HeadCell>Actions</Table.HeadCell>
                </Table.Head>
                <Table.Body>
                  {barcodes.map((item, index) => (
                    <Table.Row key={index}>
                      <Table.Cell>{item.code}</Table.Cell>
                      <Table.Cell>{item.quantity}</Table.Cell>
                      <Table.Cell>
                        <Button gradientDuoTone="pinkToOrange" size="xs" onClick={() => handleRemove(index)}>
                          <FaTrash className="h-3 w-3" />
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}

          <div className="mt-6">
            {barcodes.length > 0 ? (
              <div>
                <div id="printArea" className="rounded-lg border-2 border-blue-100 bg-white p-6 shadow-lg">
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                      gap: `${gapSize}px`,
                    }}
                  >
                    {barcodes.flatMap((item, index) =>
                      Array(item.quantity)
                        .fill(null)
                        .map((_, subIndex) => (
                          <div
                            key={`${index}-${subIndex}`}
                            className="barcode-item flex flex-col items-center rounded-md border-2 border-blue-50 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                            data-value={item.code}
                          >
                            <div className="flex justify-center w-full">
                              <Barcode
                                value={item.code}
                                width={2.5}
                                height={50}
                                fontSize={14}
                                margin={6}
                                displayValue={true}
                              />
                            </div>
                          </div>
                        )),
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">Total barcodes: {totalBarcodes}</p>
                  <div className="flex gap-2">
                    <Button gradientDuoTone="pinkToOrange" size="sm" onClick={() => setBarcodes([])}>
                      <FaTrash className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                    <Button
                      gradientDuoTone="purpleToBlue"
                      size="sm"
                      onClick={handleDownloadPDF}
                      disabled={isGenerating}
                    >
                      <FaFilePdf className="mr-2 h-4 w-4" />
                      {isGenerating ? "Generating..." : `PDF (${totalBarcodes})`}
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200">
                <BiBarcodeReader className="h-12 w-12 text-blue-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No barcodes yet</h3>
                <p className="mt-1 text-sm text-gray-500">Start by adding some barcodes using the form above</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default BarcodeGenerator

