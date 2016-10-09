var port = chrome.runtime.connect({name: "search-trek-channel"});

// need to figure out when and how to react to changes in DOM
setTimeout(function () {
    var container;

    if (document.querySelectorAll('.srg').length > 1) {
        container = document.querySelectorAll('.srg')[1];
    } else {
        container = document.querySelectorAll('.srg')[0];
    }

    var links = Array.prototype.slice.call(container.querySelectorAll('h3.r > a'));

    links.forEach(function (a) {
        a.dataset.href = a.getAttribute('href');
        a.addEventListener('click', function (event) {
            var searchText = document.querySelectorAll('.sbib_b input[title=Search]')[0].value;
            var link = event.target.dataset.href;

            port.postMessage({search: searchText, link: link});
        });
    });

}, 2000);