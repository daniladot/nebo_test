ymaps.ready(init);

function init() {
    Data = {
        mkad_km: [[55.778659, 37.840965], [55.777358, 37.8459510], [55.767514, 37.844110], [55.769059, 37.842735], [55.755034, 37.842717],
        [55.745676, 37.839869], [55.742843, 37.844720], [55.730431, 37.841756], [55.719972, 37.838252], [55.713319, 37.835495],
        [55.718370, 37.840606], [55.711351, 37.839744], [55.707862, 37.836043], [55.706056, 37.835450], [55.689568, 37.828389],
        [55.684336, 37.832997], [55.655595, 37.839762], [55.658104, 37.838378], [55.639512, 37.820376], [55.640919, 37.820834],
        [55.616071, 37.780347], [55.616061, 37.779925], [55.593232, 37.731461], [55.590114, 37.726870], [55.576197, 37.689393],
        [55.574121, 37.686707], [55.572039, 37.650711], [55.572915, 37.652795], [55.574574, 37.641809], [55.575526, 37.607475],
        [55.575765, 37.598375], [55.574686, 37.596794], [55.574686, 37.596794], [55.580513, 37.573914], [55.591203, 37.527076],
        [55.591264, 37.529502], [55.607290, 37.497342], [55.609838, 37.494279], [55.629308, 37.472270], [55.634380, 37.465497],
        [55.640086, 37.457924], [55.660612, 37.434855], [55.663715, 37.430426], [55.669265, 37.428100], [55.669006, 37.425962],
        [55.682371, 37.417652], [55.685853, 37.414948], [55.697143, 37.405866], [55.702886, 37.397943], [55.701440, 37.400270],
        [55.702886, 37.397943], [55.713785, 37.387756], [55.723192, 37.380570], [55.713126, 37.383094], [55.724008, 37.379348],
        [55.730892, 37.372889], [55.732388, 37.378019], [55.733437, 37.373797], [55.755500, 37.370239], [55.766390, 37.368011],
        [55.763969, 37.370428], [55.769378, 37.369233], [55.772178, 37.368434], [55.790712, 37.372934], [55.791010, 37.367086],
        [55.796071, 37.378477], [55.801536, 37.384648], [55.808027, 37.388601], [55.809732, 37.387038], [55.814775, 37.390865],
        [55.834815, 37.394377], [55.833430, 37.394673], [55.831003, 37.396218], [55.835457, 37.397216], [55.849433, 37.391718],
        [55.868016, 37.407654], [55.876142, 37.426528], [55.871955, 37.413655], [55.877773, 37.429142], [55.880248, 37.444045],
        [55.882702, 37.447566], [55.884434, 37.481136], [55.888336, 37.485807], [55.891587, 37.494719], [55.891587, 37.494719],
        [55.901798, 37.519674], [55.908575, 37.548492], [55.907001, 37.541350], [55.910321, 37.587614], [55.910634, 37.591171],
        [55.899855, 37.629412], [55.898725, 37.634793], [55.894561, 37.670420], [55.895298, 37.678343], [55.883767, 37.726125],
        [55.891734, 37.707296], [55.882788, 37.725083], [55.830270, 37.827832], [55.828956, 37.829449], [55.815043, 37.837228],
        [55.812626, 37.840570], [55.812626, 37.840570]],    
        myPlacemark: 0,
        mkadPoint: [],
        coords: {},
        firstGeoObject: {},
        coordinates: [],
        pathsObjects: {},
        distance: null,
        distanceOnAir: null,
        myMap: new ymaps.Map("map", {
            center: [55.751999,37.617734],
            zoom: 11,
            behaviors: ['default', 'scrollZoom'],
            controls:['zoomControl']
        }) 
    }


    //Создание точек на МКАД
    Data.mkad_km.forEach(elem => {
        Data.mkadPoint.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: elem
            }
        })
    })

    //Добавление точек на МКАД
    Data.mkadPoint = ymaps.geoQuery({
        type: 'FeatureCollection',
        features: Data.mkadPoint,
        visible: false
    }).addToMap(Data.myMap).setOptions('visible', false);

    //Слушатель нажатия на карту(Основная функция)
    Data.myMap.events.add('click', function (e) {
        Data.coords = e.get('coords');

        if (Data.myPlacemark) {
            Data.myMap.geoObjects.removeAll()
        }

        Data.myPlacemark = createPlacemark(Data.coords);
        Data.myMap.geoObjects.add(Data.myPlacemark);

        getAddress(Data.coords);
        transfer(Data.myPlacemark.geometry.getCoordinates(), Data.mkadPoint.getClosestTo(Data.myPlacemark).geometry.getCoordinates())
    });


    // Создание метки.
    function createPlacemark(coords) {
        return new ymaps.Placemark(coords, {
            iconCaption: 'поиск...'
        }, {
            preset: 'islands#violetDotIconWithCaption',
            draggable: false
        });
    }


    //Обратное Геокодирования
    function getAddress(coords) {
        Data.myPlacemark.properties.set('iconCaption', 'поиск...');
        ymaps.geocode(coords).then(function (res) {
            Data.firstGeoObject = res.geoObjects.get(0);

            if(Data.distance && Data.distanceOnAir){
                Data.myPlacemark.properties
                .set({
                    // Формируем строку с данными об объекте.
                    iconCaption: [
                        // Название населенного пункта или вышестоящее административно-территориальное образование.
                        Data.firstGeoObject.getLocalities().length ? Data.firstGeoObject.getLocalities() : firstGeoObject.getAdministrativeAreas(),
                        // Получаем путь до топонима, если метод вернул null, запрашиваем наименование здания.
                        Data.firstGeoObject.getThoroughfare() || Data.firstGeoObject.getPremise()
                    ].filter(Boolean).join(', '),
                    // В качестве контента балуна задаем строку с адресом объекта.
                    balloonContent: `${Data.firstGeoObject.getAddressLine()} /
                                     Расстояние по прямой: ${Data.distanceOnAir} км /
                                     Расстояние по дороге: ${Data.distance} км`  
                });                
            } 
            
        });
    }

    //Построение маршрута и расчёт расстояния
    function transfer(coord, coord2) {
        ymaps.route([coord, coord2]).then(
            function (res) {
                // Объединим в выборку все сегменты маршрута.
                Data.pathsObjects = ymaps.geoQuery(res.getPaths()),
                    edges = [];
               
                // Переберем все сегменты и разобьем их на отрезки.
                Data.pathsObjects.each(function (path) {
                    Data.coordinates = path.geometry.getCoordinates();
                    for (let i = 1, l = Data.coordinates.length; i < l; i++) {
                        edges.push({
                            type: 'LineString',
                            coordinates: [Data.coordinates[i], Data.coordinates[i - 1]]
                        });
                    }
                });
                ymaps.geoQuery(edges)
                    .add(res.getWayPoints())
                    .setOptions('strokeWidth', 3)
                    .addToMap(Data.myMap)
                
                Data.distance = res.getHumanLength().split('&')[0]
                Data.distanceOnAir = String(ymaps.coordSystem.geo.getDistance(coord, coord2)/1000).split('.')[0] +(".") +  String(ymaps.coordSystem.geo.getDistance(coord, coord2)/1000).split('.')[1].slice(0,2)
                getAddress(Data.coords);
                console.log(Data.distance)
                console.log(Data.distanceOnAir)
            }
        );

    }



}


