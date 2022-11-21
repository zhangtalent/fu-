$(document).ready(function () {

  function readFile (path) {
    return new Promise(function (resolve) {
      $.ajax({
        url: path,
        method: 'get',
        xhr: function () {// Seems like the only way to get access to the xhr object
          var xhr = new XMLHttpRequest()
          xhr.responseType = 'blob'
          return xhr
        },
        beforeSend: function (request) {
          request.setRequestHeader('Content-Type', 'application/octet-stream')
          request.responseType = 'blob'
        },
        success: function (response) {
          let blob = response
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result)
          }
          reader.readAsArrayBuffer(blob)
        }
      })
    })
  }
  async function getQuestionList (path) {
    let questions_map = {}
    const buffer = await readFile(path)
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)
    const worksheet = workbook.getWorksheet('sheet1')
    worksheet.eachRow(function (row, rowNumber) {
      let row_values = row.values
      questions_map[row_values[2]] = row_values[3]
    })
    return questions_map
  }
  console.log(chrome.runtime.getURL("others/lab.xlsx"))
  getQuestionList(chrome.runtime.getURL("others/lab.xlsx")).then(function (result) {
    let items = $(document).find('.exam-content-topic-item')
    $.each(items, function (index) {
      let item = items[index]
      let question = $(item).find('.exam-content-topic-m:nth(0)').text().trim()
      let answer = result[question].replaceAll('\n', '<br>')
      $(item).find('.exam-content-topic-m:nth(0)').append($(`<div style="color:blue;">答案: ${answer}</div>`))
    })
  })
})