class Books {
  elements = new Object;
  data = new Object;

  add(title, author, year, completed) {
    if (title === '') {
      return {
        result: false,
        message: 'Nama tidak boleh kosong'
      };
    }

    if (author === '') {
      return {
        result: false,
        message: 'Penerbit atau penulis tidak boleh kosong'
      };
    }

    const capitalizeWord = (str) => {
      return str.replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const isValidYear = (yr) => {
        return yr >= 1900 && yr <= 2024;
    };

    title = capitalizeWord(title);
    author = capitalizeWord(author);

    if (!isValidYear(year)) {
      return {
          result: false,
          message: 'Tahun harus antara 1900 dan 2024'
      };
  }

    const key = new Date().getTime();

    let cooked = {
      id: key,
      title: title,
      author: author,
      year: parseInt(year),
      isComplete: completed ? true : false
    }

    const exists = Object.values(this.data).some(item => {
      const { id: itemId, isComplete: itemIsComplete, ...restItem } = item;
      const { id: cookedId, isComplete: cookedIsComplete, ...restCooked } = cooked;
      return JSON.stringify(restItem) === JSON.stringify(restCooked);
  });

    if (exists) {
      return {
        result: false,
        message: 'Buku sudah ada'
      };
    }

    this.data[key] = cooked;
    this.save();

    return {result: true};
}


  remove(key) {
    delete this.data[key];
    this.save()
  }

  setRead(key) {
    this.data[key].isComplete = true;
    this.save()
  }

  setUnread(key) {
    this.data[key].isComplete = false;
    this.save()
  }

  save() {
    const stringified = JSON.stringify(this.data)
    localStorage.setItem('books-data', stringified)
  }

  alert(message) {
    const alert = this.elements.form.querySelector(".alert")
    if(message) {
      alert.classList.add('visible')
      alert.innerText = message;
    } else {
      alert.classList.remove('visible')
    }
  }

  refresh() {
    const raw = localStorage.getItem('books-data')
    const tableBody = this.elements.table.querySelector("tbody")

    if (raw) this.data = JSON.parse(raw)

    tableBody.innerHTML = '';

    if (Object.keys(this.data).length === 0) {
      var emptyRow = tableBody.insertRow();
      var cell = emptyRow.insertCell();

      emptyRow.classList.add("empty");

      cell.colSpan = 6;
      cell.textContent = 'Data tidak tersedia';
    } else {
      for(let x in this.data) {
        if(this.data.hasOwnProperty(x)) {
          ((book) => {
            let row = tableBody.insertRow();
            let titleCell = row.insertCell();
            let authorCell = row.insertCell();
            let yearCell = row.insertCell();
            let readedStatusCell = row.insertCell();
            let actionCell = row.insertCell();
            
            let readButton = document.createElement("button")
            let unReadButton = document.createElement("button")
            let deleteButton = document.createElement("button")

            readButton.textContent = "Tandai sudah dibaca"
            unReadButton.textContent = "Tandai belum selesai dibaca"
            deleteButton.textContent = "Hapus"

            readButton.className = "read"
            unReadButton.className = "unread"
            deleteButton.className = "delete"

            authorCell.innerText = this.data[x].author
            titleCell.innerText = this.data[x].title
            yearCell.innerText = this.data[x].year
            readedStatusCell.innerHTML = `${this.data[x].isComplete ? 'Sudah dibaca' : 'Belum selesai dibaca'}`

            readButton.addEventListener("click", () => {
              this.setRead(x)
              this.refresh()
            })

            unReadButton.addEventListener("click", () => {
              this.setUnread(x)
              this.refresh()
            })

            deleteButton.addEventListener("click", () => {
              this.remove(x)
              this.refresh()
            })

            if (this.data[x].isComplete) actionCell.appendChild(unReadButton);
            else actionCell.appendChild(readButton);
            
            actionCell.appendChild(deleteButton);
            actionCell.classList.add("action")
          })(this.data[x])
        }
      }
    }
  }

  open() {
    this.elements.form.classList.add("visible")
  }

  close() {
    this.elements.form.classList.remove("visible")
  }

  event() {
    const form = this.elements.form.querySelector("form");
    const cancel = document.querySelector

    form.addEventListener("submit", (event) => {
      event.preventDefault()
  
      const data = new FormData(form);

      const { result, message } = this.add(
        data.get('title'),
        data.get('author'),
        data.get('year'),
        data.get('isCompleted')
      )
      
      if (result) {
        form.reset(); 
        this.alert(null);
        this.refresh()
        this.close();
      } else {
        this.alert(message);
      }
    })

    this.elements.form.addEventListener("click", (e) => {
      if(!form.contains(e.target)) this.close()
    })
  }

  constructor(tableElement, formElement) {
    this.elements.table = tableElement;
    this.elements.form = formElement;

    this.event();
    this.refresh()
  }
}


window.addEventListener("load", () => {
  const formOpenButton = document.getElementById("books-form-toggle")
  const formCancelButton = document.getElementById("books-form-cancel")

  const books = new Books(
    document.querySelector(".table-container"),
    document.querySelector(".form-container")
  )
  
  formOpenButton.addEventListener("click", () => {
    books.open()
  })
  
  formCancelButton.addEventListener("click", () => {
    books.close()
  })
})