// most of the below was adapted from pdf.js code
var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.0, //0.8,
    canvas = null,
    ctx = null,
    speakerName = null,
    talkTitle = null,
    titleView = null,
    slideView = null,
    intervalId = null,
    talkNum = 0,
    advanceIntervalId = null,
    appState = "new";

/**
  * Get page info from document, resize canvas accordingly, and render page.
  * @param num Page number.
  */
function renderPage(num) {
  pageRendering = true;

  console.info("Rendering page #" + num);

  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport(scale);
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function () {
      pageRendering = false;

      if (pageNumPending !== null) {
        // New page rendering is pending
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });
  });
}

/**
  * If another page rendering in progress, waits until the rendering is
  * finised. Otherwise, executes rendering immediately.
  */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
  * Asynchronously downloads PDF.
  */
function presentDocument(file_path) {
  pageNum = 1;

  var url = "/presentations/files?talk_path=" + file_path;
  pdfDoc = null;

  PDFJS.getDocument(url).then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;
    // Initial/first page rendering
    renderPage(pageNum);
  });
};

function blankScreenAndPause() {
  clearInterval(advanceIntervalId);
  slideView.hide();
  titleView.hide();
}

function next() {
  if (appState === "paused") {
    console.info("unpausing");
    presentTalk();
    return;
  }

  if (appState === "title") {
    startAdvancingSlides();
    return;
  }

  pageNum++;

  if (pdfDoc === null || pageNum > pdfDoc.numPages) {
    console.info("Finished presentation, canceling auto-advance");
    blankScreenAndPause();
    talkNum++;
    appState = "paused";
  } else {
    queueRenderPage(pageNum);
  }
}

function prev() {
  if (pageNum <= 1) {
    if (talkNum > 0) {
      talkNum--;
    }
    presentTalk();
  } else {
    pageNum--;
    queueRenderPage(pageNum);
  }
}

function presentTalk() {
  slideView.hide();
  titleView.hide();

  var talk = talkData.talks[talkNum];

  if (!talk) {
    console.warn("Cannot find talk #" + talkNum);
    return;
  }

  appState = "title";
  console.info("Presenting talk #" + talkNum + ": " + talk.title + " (" + talk.file_path + ")");
  speakerName.html(talk.speaker_name || "");
  talkTitle.html(talk.title);
  titleView.show();

  if (talk.file_path) {
    presentDocument(talk.file_path); // we load up the PDF viewer in the background, while the slide page is hidden, for speed purposes
  } else {
    console.warn("Talk #" + talkNum + " has no file");
    ctx.clearRect(0,0,canvas.width,canvas.height); // don't show leftover slide from last presentation that did have a file
    return;
  }
}

function startAdvancingSlides() {
  console.info("Starting slide auto-advance");
  appState = "presenting";
  titleView.hide();
  slideView.show();
  advanceIntervalId = setInterval(next,15000);
}

function presentFirstTalk() {
  var talkNumHash = location.hash.split("=")[1];

  if (talkNumHash) {
    blankScreenAndPause();
    talkNum = Number(talkNumHash);
    console.info("Skipping to talk #" + talkNum);
  }

  presentTalk();
}

function start() {
  console.info("STARTING");

  canvas = document.getElementById('the-canvas');
  ctx = canvas.getContext('2d');
  speakerName = $("#speaker_name");
  talkTitle = $("#talk_title");
  titleView = $("#title_slide");
  slideView = $("#slides");

  $(document).keypress(function(event) {
    switch(event.keyCode) {
      case 110: // "n"
        next();
        break;
      case 112: // "p"
        prev();
      default:
        break;
    }
  });

  presentFirstTalk();
  $(window).bind("hashchange",presentFirstTalk);
}
