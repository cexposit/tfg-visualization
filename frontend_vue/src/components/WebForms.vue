<template>
  <div id="app">
    <v-app id="inspire">
      <v-container>
        <v-row>

          <v-col cols="6" md="3">
            <v-form ref="form">
              <v-text-field v-model="first_date" label="Fecha inicial"></v-text-field>
              2000-12-05 00:00:01.001
            </v-form>
            <v-checkbox v-model="include_fd" label="INCLUIR FECHA INICIAL"></v-checkbox>
          </v-col>

          <v-col cols="6" md="3">
            <v-form ref="form">
              <v-text-field v-model="last_date" label="Fecha final"></v-text-field>
              2029-12-05 00:00:01.001
            </v-form>
            <v-checkbox v-model="include_ld" label="INCLUIR FECHA FINAL"></v-checkbox>
          </v-col>

          <v-col cols="12" md="6">
            <v-form ref="form">
              <v-autocomplete v-model="current_scheme" :items="scheme_names" label="Esquemas" />
            </v-form>
          </v-col>

        </v-row>

        <div class="boton">
          <v-btn elevation="4" outlined text @click="submit">Enviar</v-btn>
        </div>


        <div class="optionCharts">
          <v-radio-group v-model="radioGroup">
            <v-radio :label="`Stacked Bar Chart`" :value=1></v-radio>
            <v-radio :label="`Bar Chart`" :value=2></v-radio>
          </v-radio-group>
        </div>

        <div class="boton">
          <v-btn elevation="4" outlined text @click="show(true)">Show</v-btn>
          <v-btn elevation="4" outlined text @click="prepareDot(true)">Puntos</v-btn>
        </div>


        <div class="stackedBarChart">
          <svg class="svgStacked" width="100%" height="0"></svg>
          <svg class="svgDot" width="100%" height="0"></svg>
        </div>

      </v-container>

    </v-app>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { mapActions } from 'vuex';
import Swal from 'sweetalert2'
import * as d3 from 'd3'


export default {
  name: 'WebForms',

  data() {
    return {
      first_date: '',
      last_date: '',
      include_fd: false,
      include_ld: false,
      scheme_names: this.get_name_schemes(),
      check_dataset: this.get_data,
      current_scheme: null,
      radioGroup: 1,
      keys_datos: []
    }
  },

  computed: {
    ...mapGetters([
      'get_data',
      'get_sizedata_from_server'
    ]),
    count() {
      return this.get_data.length
    },

  },

  methods: {

    submit() {
      let obj = {
        "scheme": this.current_scheme,
        "min": this.first_date,
        "include_min": this.include_fd,
        "max": this.last_date,
        "include_max": this.include_ld,
      }
      obj = JSON.stringify(obj)
      this.send_to_back(obj)
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Your work has been saved',
        showConfirmButton: false,
        timer: 1500
      })
    },

    async show(clear) {
    if (clear)
      d3.select("svg").selectAll("*").remove();

    var svgStacked = d3.select(".svgStacked")
      .attr("width", 900)
      .attr("height", 500)
      ,
    svgDot = d3.select(".svgDot")
      .attr("width", 900)
      .attr("height", 500),
      margin = { top: 50, right: 20, bottom: 30, left: 40 },
    width = +svgStacked.attr("width") - margin.left - margin.right,
    height = +svgStacked.attr("height") - margin.top - margin.bottom,
    bars = svgStacked.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svgDot.append("rect")
    .classed("fondo", true)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#34495e")

    svgDot.append("rect")
    .attr("width", "100%")
    .attr("height", "10")
    .attr("fill", "white")
    .attr("x",0 )
    .attr("y",+svgDot.attr("height") / 3 )

    svgDot.append("rect")
    .attr("width", "100%")
    .attr("height", "10")
    .attr("fill", "white")
    .attr("x",0 )
    .attr("y",(+svgDot.attr("height")/3)*2)

    var dots = svgDot.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xStacked = d3.scaleBand()
      .rangeRound([0, width])
      .padding(0.3)
      .align(0.1);
      
    var xDot = d3.scaleLinear()
      .range([0, width])

    var y = d3.scaleLinear().range([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#98abc5", "#ff8c00", "red", "blue", "pink", "green", "yellow", "brown", "white", "purple", "#5678aa", "#753159"]);

    let always_true = true
    let ids = []

    while (always_true) {
      if (this.get_data.length > 0) {

        var time = this.get_data[0].time
        var status = this.get_data[0].status
        var items = this.setDataset(items, status)


        this.keys_datos = Object.keys(items[0]).splice(1)

        for (let index = 0; index < items.length; index++){
            if (!ids.includes(items[index].id))
              ids.push(items[index].id)
          }

        for (let index = 0; index < items.length; index++) {
          let t = 0
          for (let i = 0; i < this.keys_datos.length; ++i)
            if (this.keys_datos[i] != "total") {
              t += items[index][this.keys_datos[i]]
            }
          items[index].total = t
        }
        this.renderDot(items, this.keys_datos, dots, xDot, y, z, height, width, time, ids)
        this.stackedChart(items, this.keys_datos, bars, xStacked, y, z, height, width, time)
        this.get_data.shift()


      }
      await this.sleep(5000)

    }

  },

      async prepareDot(){

        const svg = d3.select('.svgDot')
                    .attr('width',900 )
                    .attr('height', 500),
        margin = { top: 50, right: 20, bottom: 30, left: 40 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;
        dots = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("rect")
        .classed("fondo", true)
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "#34495e")

        svg.append("rect")
        .attr("width", "100%")
        .attr("height", "10")
        .attr("fill", "white")
        .attr("x",0 )
        .attr("y",+svg.attr("height") / 3 )

        svg.append("rect")
        .attr("width", "100%")
        .attr("height", "10")
        .attr("fill", "white")
        .attr("x",0 )
        .attr("y",(+svg.attr("height")/3)*2)

    var dots = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
    .range([0, width])

    var y = d3.scaleLinear().range([height, 0]);

    var z = d3.scaleOrdinal()
      .range(["#98abc5", "#ff8c00", "red", "blue", "pink", "green", "yellow", "brown", "white", "purple", "#5678aa", "#753159"]);

      let always_true = true
      let ids = []
      while (always_true) {
        if (this.get_data.length > 0) {

          var time = this.get_data[0].time
          var status = this.get_data[0].status
          var items = this.setDataset(items, status)


          this.keys_datos = Object.keys(items[0]).splice(1)

          
          for (let index = 0; index < items.length; index++){
            if (!ids.includes(items[index].id))
              ids.push(items[index].id)
          }

          this.renderDot(items, this.keys_datos, dots, x, y, z, height, width, time, ids)
          this.get_data.shift()


        }
        await this.sleep(5000)

      }
      },

    renderDot(data, keys, dots, x, y, z, height, width, time, ids){

      dots.selectAll("rect.legend").remove();
      dots.selectAll("text.legend").remove();
  
        const dur = 2000;
        const t = d3.transition().duration(dur);
        const radius = width / 50 / 2 ;

        var xMax = d3.max(data, function (d) { return d[keys[0]]; })
        var yMax = d3.max(data, function (d) { return d[keys[1]]; })

        x.domain([0, xMax + 10]);
        y.domain([0, yMax + 10]);
        z.domain(ids)

        dots.selectAll("circle")
        .data(data, data=>data.id)
        .join(
          enter => enter
            .append("circle")
            .attr("class", "punto")
            .attr("cx", d => {
              return x(d[keys[0]])
            })
            .attr("cy", d => {
              return y(d[keys[1]])
            })
            .attr("r", radius)
            .attr("fill", d => 
              z(d.id)
          
          ), 
            
          null,
          
          exit => {
            exit
              .transition()
              .duration(0)
              .style("fill-opacity", 0)
              .remove();
          }
        )
      .transition(t)
      .delay((d, i) => i * 20)
      .attr("cx", d => x(d[keys[0]]))
      .attr("cy", d => y(d[keys[1]]))
      .attr("r", radius)

    var legend = dots.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
        .classed("legend", true)
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", d => z(d.id))

    legend.append("text")
      .classed("legend", true)
      .attr("x", width - 24)
      .attr("y", 9.5)
      .attr("dy", "0.32em")
      .text(function (d) { return d.id; });
    },

// ----------------------------------------------------------------------------------------



    setDataset(items, status) {
      var dataset = items ? items : []

      var raw_data = JSON.parse(status)

      if (raw_data.new != undefined) {
        for (let index = 0; index < raw_data.new.length; index++) {
          let obj1 = {
            "id": raw_data.new[index].id
          }
          let obj2 = raw_data.new[index].value
          const data = {
            ...obj1,
            ...obj2
          }
          dataset.push(data)
        }
      }

      if (raw_data.update != undefined) {
        for (let index = 0; index < raw_data.update.length; index++) {
          var id_to_update = dataset.findIndex(function (dataset) {
            return dataset.id === raw_data.update[index].id
          });
          let obj1 = {
            "id": raw_data.update[index].id
          }
          let obj2 = raw_data.update[index].value
          const data = {
            ...obj1,
            ...obj2
          }
          if (id_to_update > -1)
            dataset.splice(id_to_update, 1, data)
        }
      }

      if (raw_data.delete != undefined) {
        for (let index = 0; index < raw_data.delete.length; index++) {
          var id_to_delete = dataset.findIndex(function (dataset) {
            return dataset.id === raw_data.delete[index].id
          });
          if (id_to_delete > -1)
            dataset.splice(id_to_delete, 1)
        }
      }

      return dataset
    },

    stackedChart(data, keys, bars, x, y, z, height, width, time) {
      
      keys = keys.map(key => {
        if (key != "total")
          return key
        return ""
      }).filter(key => key != "")

      d3.select("svg").selectAll(".tiempo").remove();

      var max = d3.max(data, function (d) { return d.total; })
      y.domain([0, max + 10]);
      x.domain(data.map(d => d.id));
      z.domain(keys)

      var stackData = d3.stack().keys(keys)(data);

      const dur = 2000;
      const t = d3.transition().duration(dur);

      bars
        .selectAll("g")
        .data(stackData)
        .join(
          enter => enter
            .append("g")
            .attr("fill", d => 

              z(d.key)
          
          ),

          null, // no update function

          exit => {
            exit
              .transition()
              .duration(0)
              .style("fill-opacity", 0)
              .remove();
          }
        ).selectAll("rect")
        .data(d => d, d => d.data.id)
        .join(
          enter => enter
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => {
              return x(d.data.id);
            })
            .attr("y", () => {
              return y(0);
            })
            .attr("height", () => {
              return height - y(0);
            })
            .attr("width", x.bandwidth())
          ,
          null,
          exit => {
            exit
              .transition()
              .duration(0)
              .style("fill-opacity", 0)
              .remove();
          }
        )
        .transition(t)
        .delay((d, i) => i * 20)
        .attr("x", d => x(d.data.id))
        .attr("y", d => {
          return y(d[1]);
        })
        .attr("width", x.bandwidth())
        .attr("height", d => {
          return y(d[0]) - y(d[1]);
        });

      bars.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

      bars.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y).ticks(null, "s"))
        .append("text")
        .attr("x", 2)
        .attr("y", y(y.ticks().pop()) + 0.5)
        .attr("dy", "0.32em")
        .attr("fill", "#000")
        .attr("font-weight", "bold")
        .attr("text-anchor", "start")
        .text("Population");

      var legend = bars.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

      legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

      legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(time)
        .text(function (d) { return d; });

      d3.select("svg")
        .append("text")
        .classed("tiempo", true)
        .text(function () { return time })
        .style("fill-opacity", 1)
        .attr("x", 10)
        .attr("y", 20)
    },

    sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },

    ...mapGetters([
      'get_ws',
      'get_name_schemes',
      'get_btn'
    ]),
    ...mapActions([
      'send_to_back'
    ]),
  },

  // watch: {
  //   async count(newCount) {
  //     if (newCount < 3) {
  //       let obj = {
  //         "scheme": this.current_scheme,
  //         "min": this.first_date,
  //         "include_min": this.include_fd,
  //         "max": this.last_date,
  //         "include_max": this.include_ld,
  //         "size": this.get_sizedata_from_server
  //       }
  //       obj = JSON.stringify(obj)
  //       this.send_to_back(obj)
  //     }

  //     let newData = false
  //     let size = this.get_sizedata_from_server

  //     while (newCount == 0 && size == this.get_sizedata_from_server){
  //       newData = true
  //       let obj = {
  //         "scheme": this.current_scheme,
  //         "min": this.first_date,
  //         "include_min": this.include_fd,
  //         "max": this.last_date,
  //         "include_max": this.include_ld,
  //         "size": this.get_sizedata_from_server
  //       }
  //       obj = JSON.stringify(obj)
  //       this.send_to_back(obj)
  //       await this.sleep(10000)
  //     }

  //     if (newData)
  //     this.show(false)

  //   }
  // }
}
</script>

<style>
#inspire>.v-application--wrap {
  min-height: auto !important;
}

.boton {
  display: flex;
  justify-content: flex-end;
}

.stackedBarChart {
  display: flex;
  /* justify-content: center; */
  flex-direction: column;
}
</style>