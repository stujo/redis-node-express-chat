 $(document).ready(function() {
   var name = '';
   var polling = false;

   function go() {
     name = $('#user-name').val();
     $('#user-name').val('');
     $('.user-form').hide();
     $('.chat-box').show();
     poll();
   };

   function poll() {
     $.getJSON('/poll/' + new Date().getTime(), function(response, statusText, jqXHR) {
       if (jqXHR.status == 200) {
         $('.jumbotron').hide();
         msg = response;
         var html = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">' +
           msg.username +
           '</h3></div><div class="panel-body">' + msg.message + '</div></div>';
         var d = $('.message-area');
         d.append(html);
         d.scrollTop(d.prop("scrollHeight"));
       }
       poll();
     });
   };

   $('#user-name').keydown(function(e) {
     if (e.keyCode == 13) { //Enter pressed
       go();
     }
   });

   $('.go-user').on('click', function(e) {
     go();
   });

   $('#message-input').keydown(function(e) {
     if (e.keyCode == 13) {
       $.ajax({
         type: "POST",
         url: "/msg",
         data: JSON.stringify({
           "username": name,
           "message": $('#message-input').val().trim()
         }),
         contentType: "application/json"
       });
       $(this).val('');
       $('.jumbotron').hide();
       e.preventDefault()
     }
   });



   $('.user-form').show();
 });
