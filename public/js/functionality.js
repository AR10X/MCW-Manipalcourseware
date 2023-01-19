

/* ---------------------------------------------------
    HAMBURGER ICON
----------------------------------------------------- */

$(document).ready(function () {
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
        $(this).toggleClass('active');
    });
});

/* ---------------------------------------------------
    TYPING ANIMATION
----------------------------------------------------- */
var TxtRotate = function(el, toRotate, period) {
    this.toRotate = toRotate;
    this.el = el;
    this.loopNum = 0;
    this.period = parseInt(period, 10) || 2000;
    this.txt = '';
    this.tick();
    this.isDeleting = false;
  };
  
  TxtRotate.prototype.tick = function() {
    var i = this.loopNum % this.toRotate.length;
    var fullTxt = this.toRotate[i];
  
    if (this.isDeleting) {
      this.txt = fullTxt.substring(0, this.txt.length - 1);
    } else {
      this.txt = fullTxt.substring(0, this.txt.length + 1);
    }
  
    this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';
  
    var that = this;
    var delta = 300 - Math.random() * 100;
  
    if (this.isDeleting) { delta /= 2; }
  
    if (!this.isDeleting && this.txt === fullTxt) {
      delta = this.period;
      this.isDeleting = true;
    } else if (this.isDeleting && this.txt === '') {
      this.isDeleting = false;
      this.loopNum++;
      delta = 500;
    }
  
    setTimeout(function() {
      that.tick();
    }, delta);
  };
  
  window.onload = function() {
    var elements = document.getElementsByClassName('txt-rotate');
    for (var i=0; i<elements.length; i++) {
      var toRotate = elements[i].getAttribute('data-rotate');
      var period = elements[i].getAttribute('data-period');
      if (toRotate) {
        new TxtRotate(elements[i], JSON.parse(toRotate), period);
      }
    }
    // INJECT CSS
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = ".txt-rotate > .wrap { border-right: 0.08em solid #fff }";
    document.body.appendChild(css);
  };

  $(document).ready(function() {
    //Preloader
    preloaderFadeOutTime = 1500;
    function hidePreloader() {
    var preloader = $('.spinner-wrapper');
    preloader.fadeOut(preloaderFadeOutTime);
    }
    hidePreloader();
    });


    // $(document).ready(function() {
    //   $('.video-link').on('click', function(e) {
    //     e.preventDefault();
    //     var videoLink = $(this).closest('form').attr('action');
    //     $('#video-player').attr('src', videoLink);
    //   });
    // });
  
    $(document).ready(function() {
      var defaultLink = $('.card-form').attr('action');
      $('#video-player').attr('src', defaultLink);
      $('.video-link').on('click', function(e) {
        e.preventDefault(); 
        var videoLink = $(this).closest('form').attr('action');
        $('#video-player').attr('src', videoLink);
      });
    });
    

    // $(document).ready(function () {
    //   var $sidenav = $("#left");
    //   var $sidenavResizeHandle = $("#resize-handle");
    //   var isResizing = false;
    //   var startingWidth = 0;
    //   var startingX = 0;
    
    //   $sidenavResizeHandle.on("mousedown", function (e) {
    //     isResizing = true;
    //     startingWidth = $sidenav.width();
    //     startingX = e.clientX;
    //   });
    
    //   $(document).on("mousemove", function (e) {
    //     if (!isResizing) return;
    //     var diffX = e.clientX - startingX;
    //     $sidenav.width(startingWidth + diffX);
    //   });
    
    //   $(document).on("mouseup", function () {
    //     isResizing = false;
    //   });
    // });
    


// window.onload = function() {
// const modal = document.getElementById("newCardModal");
// const form = document.getElementById("newCardForm");
// const addNewBtn = document.getElementById("addNewBtn");

// // Show the modal when the button is clicked
// addNewBtn.addEventListener("click", function() {
//   modal.style.display = "block";
// });

// // Hide the modal when the close button is clicked
// form.addEventListener("submit", function(event) {
//   event.preventDefault(); // prevent page refresh
//   const lecture = {
//     lectureNo: document.getElementById("lectureNo").value,
//     lectureTopic: document.getElementById("lectureTopic").value,
//     dateTime: document.getElementById("dateTime").value,
//     teacherName: document.getElementById("teacherName").value
//   };
//   // Send a POST request to the server to create the new lecture
//   // use fetch or axios library or any other http library
//   // you can also use XMLHttpRequest 
//   fetch('/lectures', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(lecture)
//   }).then(response => {
//     if (response.ok) {
//       return response.json();
//     } else {
//       throw new Error('Failed to create lecture');
//     }
//   }).then(data => {
//     alert('Lecture created successfully');
//       modal.style.display = "none";
//       form.reset(); // Reset the form fields
//     }).catch(error => {
//       console.error('Error:', error);
//       alert('Failed to create lecture');
//     });
//   });
// }


function deleteLecture(lectureId) {
  console.log(lectureId);
  fetch('/videoConsole/' + lectureId, {
      method: 'DELETE',
  }).then(res => {
      if(res.status === 200) {
          alert("Lecture deleted successfully!");
          // code to remove the deleted lecture from the UI, for example:
          document.getElementById(`lecture-${lectureId}`).remove();
          location.reload();
      } else {
          alert("An error occurred while trying to delete the lecture. Please try again later.");
      }
  }).catch(err => {
      console.log(err);
      alert("An error occurred while trying to delete the lecture. Please try again later.");
  });
}



//Function to open modal
function openEditModal(lectureId) {
  // Fetching data for the lecture
  
  fetch(`/videoConsole/${lectureId}`)
    .then(res => res.json())
    .then(lecture => {
      // Populating the modal with the lecture data
      document.getElementById("edit-form").setAttribute("data-lecture-id", lecture._id);
      document.getElementById('edit-modal-lecture-no').value = lecture.lecture_no;
      document.getElementById('edit-modal-lecture-topic').value = lecture.lecture_topic;
      document.getElementById('edit-modal-date-time').value = lecture.date_time;
      document.getElementById('edit-modal-teacher-name').value = lecture.teacher_name;
      document.getElementById('edit-modal-lecture-link').value = lecture.link;
      // Showing the modal
      document.getElementById('edit-modal').style.display = "block";
      
    });
}

// Function to close modal
function closeEditModal() {
  document.getElementById('edit-modal').style.display = "none";
}

// Function to handle form submission
function editLecture(event) {
  event.preventDefault();
  
  const lectureId = event.target.dataset.lectureId;
  const lectureNo = document.getElementById('edit-modal-lecture-no').value;
  const lectureTopic = document.getElementById('edit-modal-lecture-topic').value;
  const dateTime = document.getElementById('edit-modal-date-time').value;
  const teacherName = document.getElementById('edit-modal-teacher-name').value;
  const lectureLink = document.getElementById('edit-modal-lecture-link').value;

  let data = {};
  data.lecture_no = lectureNo;
  data.lecture_topic = lectureTopic;
  data.date_time = dateTime;
  data.teacher_name = teacherName;
  data.link = lectureLink;

  // Making a PATCH request to the server
  fetch(`/videoConsole/${lectureId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
  }).then(res => {
    if (res.status === 200) {
        alert("Lecture edited successfully!");
        closeEditModal();
        location.reload();
    } else {
        alert("An error occurred while trying to edit the lecture. Please try again later.");
      }
    })
    .catch(err => {
        console.log(err);
        alert("An error occurred while trying to edit the lecture. Please try again later.");
    });
  }
  

  //ADD feature
  
  function closeNewCardModal() {
    document.getElementById("newCardModal").style.display = "none";
  }
  

  function createLecture(branch, section, subject) {
    const branchName = branch;
    const sectionName = section;
    const subjectName = subject;
    const lectureNo = document.getElementById("add-lectureNo").value;
    const lectureTopic = document.getElementById("add-lectureTopic").value;
    const dateTime = document.getElementById("add-dateTime").value;
    const teacherName = document.getElementById("add-teacherName").value;
    const lectureLink = document.getElementById("add-lectureLink").value;
    const data = {  branch_code: branchName, 
                    section: sectionName, 
                    subject_code: subjectName, 
                    lecture_no: lectureNo, 
                    lecture_topic: lectureTopic, 
                    date_time: dateTime, 
                    teacher_name: teacherName, 
                    link: lectureLink 
                  };
    fetch('/createLecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (res.status === 201) {
            alert("Lecture created successfully!");
            closeNewCardModal();
            location.reload();
        } else {
            alert("An error occurred while trying to create the lecture. Please try again later.");
        }
    })
    .catch(err => {
        console.log(err);
        alert("An error occurred while trying to create the lecture. Please try again later.");
    });
}
