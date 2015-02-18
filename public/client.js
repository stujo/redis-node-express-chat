 $(document).ready(function() {
   var name = '';

   var client = new BroadcastHubClient();
   client.subscribe('chatter');
   client.on('message:chatter', function(payload) {
    var msg = JSON.parse(payload);
     $('.jumbotron').hide();
     var html = '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">' +
       msg.username +
       '</h3></div><div class="panel-body">' + msg.message + '</div></div>';
     var d = $('.message-area');
     d.append(html);
     d.scrollTop(d.prop("scrollHeight"));
   });

   function go() {
     name = $('#user-name').val();
     $('#user-name').val('');
     $('.user-form').hide();
     $('.chat-box').show();
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
       e.preventDefault()

       var message = $('#message-input').val().trim();
       if (message) {
         $.ajax({
           type: "POST",
           url: "/msg",
           data: JSON.stringify({
             "username": name,
             "message": message
           }),
           contentType: "application/json"
         });
         $(this).val('');
         $('.jumbotron').hide();
       }
     }
   });

   $('.user-form').show();
 });
