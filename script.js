// Features to add: 
//  - click away / escape input form
//      - problem: propegation from clicks on form?
//  - "*record always exists" message if user enters duplicate
//      - remove on refresh
//  - add event listener to bookshelf to delegate to future children instead of each child when made
//      - reconfigure book html items to use data attributes that match book ID's

let myLibrary = localStorage.getItem('booksLibrary') ? JSON.parse(localStorage.getItem('booksLibrary')) : [];

// DOM elements //
// Bookshelf
const bookshelf = document.getElementById('bookshelf');
const btnAddBook = document.getElementById('addBookButton');

// New book form
const newBookFormPopUp = document.getElementById('newBookFormPopUp');
const newBookForm = document.getElementById('newBookForm');
const inpFormTitle = document.getElementById('title');
const inpFormAuthor = document.getElementById('author');
const inpFormYear = document.getElementById('year');
const inpFormStatus = document.getElementById('readStatus');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancel = document.getElementById('btnCancel');

updateShelf(myLibrary);

// event bindings
btnAddBook.onclick = () => newBookFormPopUp.setAttribute('style', 'display: flex');

btnCancel.onclick = () => {
  newBookFormPopUp.setAttribute('style', 'display: none');
  newBookForm.reset();
}

newBookForm.addEventListener('submit', handleSubmit);

function handleSubmit (e) {
    e.preventDefault();
    
    // display book
    addBookToLibrary(myLibrary, inpFormTitle.value, inpFormAuthor.value, inpFormYear.value, inpFormStatus.checked);
    updateShelf(myLibrary);

    // close form
    newBookFormPopUp.setAttribute('style', 'display: none');
    newBookForm.reset();
}

class Book {
  constructor(bookID, title, author, year, coverColour, readStatus) {
    this.bookID = bookID;
    this.title = title;
    this.author = author;
    this.year = year;
    this.coverColour = coverColour;
    this.readStatus = readStatus;
  }
          
  toggleReadStatus() {this.readStatus = !this.readStatus};
}


function addBookToLibrary(library, title, author, year, readStatus, coverColour) {
    if (checkDuplicateBooks(library, title, author, year)) {
      // TODO: send duplication message to user
      console.log('Record already exists.');
      return;
    }

    const newBook = new Book(
      generateID(library),
      formatText(title),
      formatText(author),
      year,
      newCoverColour(),
      Boolean(readStatus)
    );
  
    library.push(newBook);
}
  
function checkDuplicateBooks (library, title, author, year) {
  // returns true if record already exists
  return library.some(elem => {
    return elem.title.toLowerCase() === title.toLowerCase() && 
            elem.author.toLowerCase() === author.toLowerCase() && 
            elem.year.toLowerCase() === year.toLowerCase();
  });
}
  
function generateID (library) {
  // find most recent ID num (highest)
  const latestID = library.reduce((highest, next) => {
    return next.bookID > highest ? next.bookID : highest;
  }, 0);
  // return new ID
  return latestID + 1;
}

function formatText (string) {
  return string.trim()
                .split(" ")
                .map((word) => word[0].toUpperCase() + word.substring(1))
                .join(" ");
}

function newCoverColour () {
  return randomChoice(['#6495ed', '#edbc64', '#64daed', '#ed6495', '#95ed64']);
}
  
function randomChoice (arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function updateShelf (library) {  
  // new shelf
  let newShelf = [];
  library.forEach((bookListing) => {
    const nextBook = makeBookHTML(bookListing, library);
    newShelf.push(nextBook);
  });

  // swap in, preserve new book button in end position
  bookshelf.replaceChildren(...newShelf, btnAddBook);
  
  // Add to local storage
  localStorage.setItem('booksLibrary', JSON.stringify(library));
}

function makeBookHTML (bookInfo, library) {
    // base div
    const book = document.createElement('div');
    book.className = 'bookTemplate';
    book.id = bookInfo.bookID; 

    // cover card div    
    const coverCard = document.createElement('div');
    coverCard.className = 'bookTemplate cover';
    coverCard.style.backgroundColor = bookInfo.coverColour; 

    const titleBanner = document.createElement('div');
    titleBanner.className = 'titleBanner';
    titleBanner.textContent = `${bookInfo.title} \nby \n${bookInfo.author}`;
    
    // info card div
    const infoCard = document.createElement('div');
    infoCard.className = 'bookTemplate infoCard';
    infoCard.style.display = 'none';
    infoCard.textContent = `Title: ${bookInfo.title} \nAuthor: ${bookInfo.author} \n\
                                Year: ${bookInfo.year} \n\
                                Status: ${bookInfo.readStatus ? 'Read' : 'Not read'}`;
    
    // flip cards
    coverCard.onmouseover = () => {
      coverCard.style.display = 'none';
      infoCard.style.display = 'block';
    };

    infoCard.onmouseleave = () => {
      coverCard.style.display = 'block';
      infoCard.style.display = 'none';
    };

    // corner buttons bar
    const cornerButtons = document.createElement('div');
    cornerButtons.className = 'cornerButtonsBar';

    // close button
    const close = document.createElement('div');
    close.className = 'cornerButton';

    const cross = document.createElement('span');
    cross.className = "material-icons-outlined close";
    cross.textContent = "close";

    // read status toggle
    const readToggle = document.createElement('div');
    readToggle.className = 'cornerButton';

    const bookIcon = document.createElement('span');
    bookIcon.className = "material-icons-outlined readToggle";
    bookIcon.textContent = "menu_book";
  
    // button colour scheme based on read status
    if (bookInfo.readStatus) {
      cross.style.color = bookInfo.coverColour;
      bookIcon.style.color = bookInfo.coverColour;

    } else {
      cross.style.color = '#808080';
      bookIcon.style.color = '#808080';
    }

    // compile
    close.appendChild(cross);
    cornerButtons.appendChild(close);

    readToggle.appendChild(bookIcon);
    cornerButtons.appendChild(readToggle);

    coverCard.appendChild(titleBanner);

    book.appendChild(cornerButtons);
    book.appendChild(coverCard);
    book.appendChild(infoCard);

    // bindings
    cross.onclick = () => destroyBook(bookInfo.bookID, library);
    bookIcon.onclick = () => toggleReadStatus(bookInfo.bookID, library)
    
    return book;
  }

  function destroyBook (idNum, library) {
    for (let i = 0; i < library.length; i++) { 
      if (library[i].bookID === idNum) { 
        library.splice(i, 1);
        break;
      }
    }
    updateShelf(library);
  }

  function toggleReadStatus (idNum, library) {
    for (let i = 0; i < library.length; i++) { 
      if (library[i].bookID === idNum) { 
        library[i].readStatus = !library[i].readStatus;
        break;
      }
    }
    updateShelf(library);
  }