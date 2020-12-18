var buttons = {'rockclimbingButton': 1, 'climbingButton': 1, 'hikingButton': 1};
var active = [];
var addButtons = [];

function scrollWin() {
    window.scrollBy(0, window.innerHeight * 2);
}

async function loadJSON(path) {
    let response = await fetch(path);
	let dataset = await response.json(); // Now available in global scope
	return dataset;
}

function showDescription(buttonId) {

    description = document.getElementById('description-container');

    if (description.children.length == 4) {
        description.removeChild(description.lastChild);
        description.removeChild(description.lastChild);
    }

    var newText = document.createElement('p');
    var newFigure = document.createElement('figure');
    var newImg = document.createElement('img');
    var newCap = document.createElement('figcaption');
    if (buttonId == 'climbingButton') {
        var addedDescription = document.createTextNode('According to Wikipedia, \
        Climbing is the activity of using one\'s hands, feet, or any other part \
        of the body to ascend a steep topographical object. It\'s a very general \
        sport with many, many subsports. Climbing shoes are generally small, tight, \
        and have a pinched toebox to provide leverage on small jagged edges.');
        newImg.src = 'images/climbing_shoes.jpg';
        newImg.alt = 'Climbing Shoes';
        newCap.innerHTML = 'La Sportiva Tarantulace Climbing Shoes. From \
        <a href="https://www.rei.com/product/165183/la-sportiva-tarantulace\
        -climbing-shoes">REI</a>';
        newFigure.appendChild(newImg);
        newFigure.appendChild(newCap);
    }
    if (buttonId == 'hikingButton') {
        var addedDescription = document.createTextNode("Hiking is a form of \
        exercise involving walking up an incline such as a hill or mountain. Hiking \
        shoes are highly reliant on strong traction to traverse across difficult \
        terrain.");
        newImg.src = 'images/hiking_shoes.jpg';
        newImg.alt = 'Hiking Shoes';
        newCap.innerHTML = 'La Sportiva TX Guide Approach Shoes - Men\'s. From \
        <a href="https://www.rei.com/product/165429/la-sportiva-tx-guide-approac\
        h-shoes-mens">REI</a>';
        newFigure.appendChild(newImg);
        newFigure.appendChild(newCap);
    }
    if (buttonId == 'rockclimbingButton') {
        var addedDescription = document.createTextNode("Rock Climbing is a subset\
         of climbing that, simply put, involves climbing rocks outdoors. For different \
         types of rock, there are specific types of rock climbing. For example, climbing \
         on boulders (generally smaller than 30 ft.) is called bouldering, and climbing \
         using cracks in the rock is called crack climbing, and so on. However, the \
         terminology is incredibly nuanced, so rock climbing is often used interchangeably \
         with just climbing. ");
        newImg.src = 'images/rock_climbing_shoes.jpg';
        newImg.alt = 'Rock Climbing Shoes';
        newCap.innerHTML = 'TENAYA Tarifa Climbing Shoes. From \
        <a href="https://www.rei.com/product/168694/tenaya-tarifa-climbing-shoes"\
        >REI</a>';
        newFigure.appendChild(newImg);
        newFigure.appendChild(newCap);
    }
    newText.appendChild(addedDescription);
    description.appendChild(newText);
    description.appendChild(newFigure);
}

function loadData() {

    document.getElementById('next').disabled = false;

    var toAppear = document.getElementsByClassName('appear');
    for (var i = 0; i < toAppear.length; i++) {
        toAppear[i].style.display = 'block';
    }
    addButtons = [];
	shoePromise = loadJSON('data.json');
	shoePromise.then(function (shoeData) {
        Object.entries(shoeData).map(item => {
            var uses = item[1]['Best Use'][0].split(', ');
            if (active.some(r=> uses.includes(r))) {
                if (!addButtons.includes(item[0])) {
                    addButtons.push(item[0]);
                }
            }
        })

        var difficulties = [];
        var totalCounts = {};

        // First Sunburst Level
        var a;
        var colors = {'Hiking': '#a5ff99', 'Climbing': '#ffe49c', 'Rock Climbing': '#99d5ff'}
        for (var a=0; a < active.length; a++) {
            toAdd = {id: active[a], parent: '', name: active[a], color: colors[active[a]]};
            difficulties.push(toAdd);
        }

        // Second Sunburst Level
        var i;
        for (var i=0; i < active.length; i++) {
            var counts = {};
            var x;
            for (var x=0; x < addButtons.length; x++) {
                var uses = shoeData[addButtons[x]]['Best Use'][0].split(', ');
                var shoeType = shoeData[addButtons[x]]['Climbing Shoe Type'];
                if (uses.includes(active[i])) {

                    if (typeof(shoeType) !== 'undefined') {
                        counts[shoeType[0]] = (counts[shoeType[0]] || 0) +1 ;
                    }
                    else {
                        counts['Neutral'] = (counts['Neutral'] || 0) +1 ;
                    }
                }
            }
            totalCounts[active[i]] = counts;
        }

        for (const index in totalCounts) {

            for (const secondIndex in totalCounts[index]) {
                
                var toAdd = {id: index + secondIndex, parent: index,
                    name: secondIndex,
                    value: totalCounts[index][secondIndex]};
                difficulties.push(toAdd);
            }
        }

        // price plot
        var priceRatings = {};
        var i;
        for (var i=0; i < active.length; i++) {
            var priceRating = [];
            var x;
            for (var x=0; x < addButtons.length; x++) {
                var uses = shoeData[addButtons[x]]['Best Use'][0].split(', ');
                if (uses.includes(active[i])) {
                    singlepriceRating = {
                        'name': addButtons[x],
                        'x': shoeData[addButtons[x]]['price'],
                        'y': shoeData[addButtons[x]]['average_rating']
                    }
                    priceRating.push(singlepriceRating);
                }
            }
            priceRatings[active[i]] = priceRating;
        }
        var scatterData = [];
        
        for (const index in priceRatings) {
            scatterData.push({name: index, color: colors[index], data: priceRatings[index]});
        }

        genPlots(difficulties, scatterData);
	});
}

function genBar(name, color) {
    document.getElementById('bar').style.display = 'block';

    shoePromise = loadJSON('data.json');
	shoePromise.then(function (shoeData) {
        var ratings = Object.values(shoeData[name]['ratings_histogram']);

        var bar = new Highcharts.chart('bar', {
            chart: {
                type: 'bar',
                backgroundColor: 'transparent'
            },
            title: {
                text: name + ' Rating Distribution',
                style: {
                    color: '#FFAF35'
                }
            },
            xAxis: {
                categories: ['1', '2', '3', '4', '5'],
                title: {
                    text: 'Rating',
                    style: {
                        color: '#FFAF35'
                    }
                },
                labels: {
                    style: {
                        color: '#FFAF35'
                    }
                }
            },
            yAxis: {
                tickInterval: 1,
                startOnTick: 0,
                title: {
                    text: 'Number of Ratings',
                    style: {
                        color: '#FFAF35'
                    }
                },
                labels: {
                    style: {
                        color: '#FFAF35'
                    }
                }
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true,
                        style: {
                            color: '#FFAF35'
                        }
                    }
                },
                series: {
                    color: color
                }
            },
            legend: {
                enabled: false
            },
            series: [{
                name: 'Ratings',
                data: ratings
            }]
        });
    });
}

function genPlots(data, scatterData) {

    // Sunburst Chart
    var sunburst = new Highcharts.chart('sunburst', {
        chart: {
            backgroundColor: 'transparent',
        },
        title: {
            text: 'Climbing Shoe Types',
            style: {
                color: '#FFAF35'
            }
        },
        subtitle: {
            text: 'This sunburst plot shows the number of shoes in the REI catalog that fall into each category.',
            style: {
                color: '#FFAF35'
            }
        },
        plotOptions: {
            sunburst: {
                tooltip: {
                    pointFormat: "{point.name}: {point.value} shoes",
                    enabled: true
                }
            }
        },
        series: [{
            type: "sunburst",
            borderColor: '#242627',
            data: data,
            style: {
                color: '#FFAF35'
            }
        }]
    });

    // Scatter Plot
    var scatter = new Highcharts.chart('scatter', {
        chart: {
            defaultSeriesType: 'scatter',
            zoomType: 'xy',
            backgroundColor: 'transparent'
        },
        title: {
            text: 'Price Versus Average Rating on Selected Shoes',
            style: {
                color: '#FFAF35'
            }
        },
        subtitle: {
            text: 'Source: REI Climbing Shoes Catalog',
            style: {
                color: '#FFAF35'
            }
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Price ($)',
                style: {
                    color: '#FFAF35'
                }
            },
            labels: {
                style: {
                    color: '#FFAF35'
                }
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true
        },
        yAxis: {
            labels: {
                style: {
                    color: '#FFAF35'
                }
            },
            max: 5,
            min: 0,
            title: {
                text: 'Average Rating',
                style: {
                    color: '#FFAF35'
                }
            }
        },
        legend: {
            align: 'right',
            verticalAlign: 'top',
            layout: 'vertical',
            backgroundColor: 'transparent',
            borderWidth: 1,
            itemStyle: {
                color: ' #FFAF35'
            },
            itemHoverStyle: {
                color: 'white'
            },
            itemHiddenStyle: {
                color: 'gray'
            }
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 4,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)'
                        }
                    }
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false
                        }
                    }
                },
                tooltip: {
                    pointFormat: "<b>{point.name}:</b><br><b>${point.x}, {point.y} Stars</b>",
                    enabled: true
                },
                cursor: 'pointer',
                events: {
                    click: function(event) {
                        genBar(event.point.name, event.point.color);
                        createList(event.point.name);
                        setTimeout(() => { scrollWin(); }, 100);
                    }
                }

            }
            
        },
        series: scatterData
    });

    if (active.length == 0) {
        sunburst.destroy();
        scatter.destroy();
        document.getElementById('bar').style.display = 'none';
        var listContainer = document.getElementById('bar-description');
        while(listContainer.firstChild){
            listContainer.removeChild(listContainer.firstChild);
        }
    }
}

function createList(key) {
    var listContainer = document.getElementById('bar-description');
    while(listContainer.firstChild){
        listContainer.removeChild(listContainer.firstChild);
    }
    var list = document.createElement('ul');
    var title = document.createElement('h3');
    title.appendChild(document.createTextNode('Features'));
    
    shoePromise = loadJSON('data.json');
	shoePromise.then(function (shoeData) {

        for (index = 0; index < shoeData[key]['features'].length; index++) { 
            var li = document.createElement('li');
            li.appendChild(document.createTextNode(shoeData[key]['features'][index]));
            list.appendChild(li);            
        }
        listContainer.appendChild(title);
        listContainer.appendChild(list);
    });
}


function setColor(btn) {
    var property = document.getElementById(btn);
    
    if (buttons[btn] == 0) {
        property.style.backgroundColor = "white"
        buttons[btn] = 1;

        const index = active.indexOf(property.innerHTML);
        if (index > -1) {
            active.splice(index, 1);
        }

    }
    else {
        property.style.backgroundColor = "#FFAF35"
        buttons[btn] = 0;
        active.push(property.innerHTML);
    }
}