var kyp = Kyp(),
  main = el("main")[0],
  add = el(".add")[0],
  footer = el("footer")[0];

el("main")[0].addEventListener("click", function(e){
  if(!e.target.classList.contains("group")) return;
  e.target.parentNode.parentNode.classList.toggle("expand");
});

add.addEventListener("click", function(){
  if(add.classList.contains("nogroups")) add.classList.remove("nogroups");

  var section = t("section", {classes: ["hide"]})([
    t("header")([t("h3", {classes: ["group"]})("Test")])
  ]);
  main.insertBefore(section, footer);

  var data = [
    {src: "http://www.imgbase.info/images/safe-wallpapers/anime/anime_scenery/39470_anime_scenery_girl_and_landscape.jpg", title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quis euismod leo, sed luctus neque."},
    {src: "http://www.magic4walls.com/wp-content/uploads/2013/12/442629-6112x2917.jpg", title: "Sed ac lectus non dui vehicula iaculis ut a ligula. Mauris vitae nunc at justo consectetur venenatis sed vel neque."},
    {src: "http://digital-art-gallery.com/oid/6/1600x977_2528_Cloud_Battle_2d_anime_landscape_cloud_autumn_picture_image_digital_art.jpg", title: "Morbi aliquam est eget ligula ornare, et tristique tortor aliquam. "},
    {src: "https://s-media-cache-ak0.pinimg.com/736x/17/e1/57/17e1575da876cbfad611a964bb84312d.jpg", title: "Fusce ut odio placerat, mattis tellus eu, dignissim nunc. Fusce nibh diam, volutpat ac massa vitae, tempor gravida velit."},
    {src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcJZjD2iux3RzbN7xECvjdjOVtpIdPRo1cj-bvn4bmidulxUvWYw", title: "Quisque ultricies tempus cursus. Nulla egestas ut dolor vel commodo."},
    {src: "https://s-media-cache-ak0.pinimg.com/736x/72/18/da/7218da15a449e134985f46abfcd9a43e.jpg", title: "Nam finibus consequat massa, malesuada porttitor erat feugiat vel. "},
    {src: "http://data.whicdn.com/images/141864785/large.jpg", title: "Vivamus ultricies feugiat feugiat."}
  ];
  data.forEach(function(e){section.appendChild(videoDom(e))});

  setTimeout(function(){section.classList.remove("hide");}, 5);
});

function videoDom(data){
  return t(".video")([
    t("img", {src: data.src})(),
    t("a", {href: data.href || ""})(data.title),
    t("p")(data.channel || "KBS World TV")
  ]);
}
