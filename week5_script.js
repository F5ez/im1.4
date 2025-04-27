const day = 24.0*60*60; //тривалість земного дня у секундах
const dt = day/0.5; //крок інтегрування
const G=6.67e-11; //гравітаційна стала
let VISUAL_SCALE_FACTOR = 1;

AFRAME.registerComponent('planet', {
    schema: {
        name: {type: 'string', default: ""}, //ім'я планети
        //середня відстань планети від Сонця
        dist: {type: 'number', default: 0},
        mass: {type: 'number', default: 0}, //маса планети, кг
        T: {type: 'number', default: 0}, //планетарний рік, земних днів
        v: {type: 'array', default: [0,0,0]}, //вектор швидкості
        a: {type: 'array', default: [0,0,0]}, //вектор прискорення
        //координатний радіус-вектор
        pos: {type: 'array', default: [0,0,0]},
        vS: {type: 'number', default: 0}

    },
    init: function () {
        this.data.T*=day; //переводимо із земних днів у секунди
        this.data.pos[0]=this.data.dist; //розташовуємо на вісі x
        //візуальну позицію виражаємо у мільйонах кілометрів
        this.el.setAttribute('position',this.data.dist/1e9+' 0 0');
        if(this.data.T!=0)//для всіх об'єктів, крім Сонця,
            //обчислюємо початкову швидкість вздовж вісі y
            this.data.v[1] = 2*Math.PI*this.data.dist/this.data.T;

    }
});

AFRAME.registerComponent('main', {
    init: function() {
        this.solar_system = document.querySelectorAll('[planet]');
    },
    tick: function (time, deltaTime) {
        for(var i = 0; i < this.solar_system.length; i++) {
            let planetEntity = this.solar_system[i];
            let planetData = planetEntity.components.planet.data;

            // 🛑 Фиксируем Солнце
            if (planetData.name === "Sun") {
                planetData.v = [0, 0, 0];
                planetData.a = [0, 0, 0];
                planetData.pos = [0, 0, 0];
                planetEntity.setAttribute('position', '0 0 0');
                continue;
            }

            // остальной код расчета гравитации и движения
        }

        for(var i = 0; i<this.solar_system.length; i++) {
            let planetEntity = this.solar_system[i];
            let planetData = planetEntity.components.planet.data;

            planet_i=this.solar_system[i].getAttribute('planet');
            planet_i.a[0]=planet_i.a[1]=planet_i.a[2]=0;
            for(var j = 0; j<this.solar_system.length; j++) {
                planet_j=this.solar_system[j].getAttribute('planet');
                if(i!=j) {
                    deltapos = [0,0,0];
                    for(var k = 0; k < 3; k++)
                        deltapos[k]=planet_j.pos[k]-planet_i.pos[k];
                    var r=Math.sqrt(Math.pow(deltapos[0],2)+
                        Math.pow(deltapos[1],2)+Math.pow(deltapos[2],2));
                    for(var k = 0; k < 3; k++)
                        planet_i.a[k]+=G*planet_j.mass*deltapos[k]/
                            Math.pow(r, 3);
                }
            }
            for(var k = 0; k < 3; k++)
                planet_i.v[k]+=planet_i.a[k]*dt;
            for(var k = 0; k < 3; k++)
                planet_i.pos[k]+=planet_i.v[k]*dt;
            this.solar_system[i].setAttribute('position',
                (planet_i.pos[0]/1e9)+' '+(planet_i.pos[1]/1e9)+
                ' '+(planet_i.pos[2]/1e9));
            let visualScale = planetData.vS || VISUAL_SCALE_FACTOR;

            this.solar_system[i].setAttribute('position',
                (planet_i.pos[0]/1e9 * visualScale)+' '+
                (planet_i.pos[1]/1e9 * visualScale)+' '+
                (planet_i.pos[2]/1e9 * visualScale));
        }

    }


});

AFRAME.registerComponent('saturn-rings', {
    schema: {
        parentId: {type: 'string', default: ''}
    },
    tick: function () {
        if (!this.parentPlanet) {
            this.parentPlanet = document.querySelector('#' + this.data.parentId);
            if (!this.parentPlanet) return;
        }

        // Копируем позицию родительской планеты
        const parentPosition = this.parentPlanet.getAttribute('position');
        this.el.setAttribute('position', parentPosition);

        // Копируем вращение (если нужно)
        const parentRotation = this.parentPlanet.object3D.rotation;
        this.el.object3D.rotation.y = parentRotation.y;
    }
});