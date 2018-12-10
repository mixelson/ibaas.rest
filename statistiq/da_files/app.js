let custom_start;
let custom_end;
let labels = [];
let gtype = 'bar';
let date_point = 'week';
let direct_point = 'ALL';
let traffic_point = 'whole';
let magic_point = 'inn';
let color1 = '#868e95';
let color2 = '#007bff';

// Turn on region tables by adding regTable=true to query.
let showRegTables = window.URLSearchParams &&
  new window.URLSearchParams(window.location.search).get('regTable') === 'true';

$(function() {
  $('.js-regionspread-container').toggle(showRegTables);

  $('#inn').prop('checked', true);

  initsql();

  browse(date_point);

  moment.locale('ru');

  $('#timetime').daterangepicker({ 'applyClass': 'btn-primary' }, function(start, end, label) {
    custom_start = start.toDate();
    custom_end = end.toDate();

    browse('custom');
  });

  $('.js-top-menu a').on('click', $evt => {
    $evt.currentTarget.id && direct($evt.currentTarget.id);

    return false;
  });
});

function piechart() {
  $('#iframe').hide('slow');
  $('#summa').hide('slow');
  $('#tframe').hide('slow');
  $('#spock').hide('slow');
  $('#downloadbutton').hide('slow');
  $('#pframe').show('slow');


  let chart = $('#chart1').data('chart');

  let xx = 0;
  let yy = 0;

  for ($i = 0; $i < chart.data.datasets[0].data.length; $i++) {
    let x = chart.data.datasets[0].data[$i].y;
    xx += x;
    let y = chart.data.datasets[1].data[$i].y;
    yy += y;
  }

  // console.log('PIE: '+xx+' '+yy);

  let config = {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [xx, yy],
          backgroundColor: [
            color1,
            color2
          ]
        }
      ],
      labels: [
        chart.data.datasets[0].label,
        chart.data.datasets[1].label
      ]
    },
    options: {
      responsive: true,
      legend: {
        position: 'top'
      },
      animation: {
        animateScale: true,
        animateRotate: true
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            return data.labels[tooltipItem.datasetIndex] + ': ' + respace(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]);
          }
        }
      }
    }
  };

  let ctx = $('.chart2').get(0).getContext('2d');
  new Chart(ctx, config);
}

function tableit() {
  $('#iframe').hide('slow');
  $('#summa').hide('slow');
  $('#tframe').show('slow');
  $('#pframe').hide('slow');
  $('#spock').hide('slow');
  $('#downloadbutton').show('slow');

  let chart = $('#chart1').data('chart');


  let xx = 0;
  let yy = 0;
  let st = 'style="text-align: right;"';

  let tablestring = '<table class="table  table-hover" ' + st + '>'; // table-inverse table-striped
  tablestring += '<tr class="bg-primary" style="color:white;"><th># периода</th><th ' + st + '>' + chart.data.datasets[0].label + '</th><th ' + st + '>' + chart.data.datasets[1].label + '</th></tr>';

  for ($i = 0; $i < chart.data.datasets[0].data.length; $i++) {
    let x = chart.data.datasets[0].data[$i].y;
    xx += x;
    let y = chart.data.datasets[1].data[$i].y;
    yy += y;
    tablestring += '<tr><th scope="row">' + labels[$i].caption + '</th><td style="color:' + color1 + '">' + respace(x + ' 00') + '</td><td style="color:' + color2 + '">' + respace(y + ' 00') + '</td></tr>';
  }
  tablestring += '<tr><th>Итого</th><th ' + st + '>' + respace(xx + ' 00') + '</th><th ' + st + '>' + respace(yy + ' 00') + '</th></tr>';
  tablestring += '</table>';
  $('#chartd').html(tablestring);
}

function respace(i) {
  i = i.toString();
  // console.log(i);
  i = i.replace(new RegExp('^(\\d{' + (i.length % 3 ? i.length % 3 : 0) + '})(\\d{3})', 'g'), '$1 $2').replace(/(\d{3})+?/gi, '$1 ').trim();
  // console.log(i);
  i = i.replace(/00$/, '');

  // console.log(i);
  return i;
}

function initsql() {
  select_traffic = '';
  select_type = '';
  date_marker = '';
  date_interval = '';
}

function browse(id) {
  // alert(id);
  $('#hour').removeClass('badge-secondary');
  $('#day').removeClass('badge-secondary');
  $('#week').removeClass('badge-secondary');
  $('#month').removeClass('badge-secondary');
  $('#year').removeClass('badge-secondary');
  //
  $('#hour').removeClass('badge-primary');
  $('#day').removeClass('badge-primary');
  $('#week').removeClass('badge-primary');
  $('#month').removeClass('badge-primary');
  $('#year').removeClass('badge-primary');
  //
  $('#hour').addClass('badge-secondary');
  $('#day').addClass('badge-secondary');
  $('#week').addClass('badge-secondary');
  $('#month').addClass('badge-secondary');
  $('#year').addClass('badge-secondary');
  //
  $('#' + id).removeClass('badge-secondary');
  $('#' + id).addClass('badge-primary');

  $('#timeblock').hide();
  $('#switcher').hide();

  date_point = id;
  loadgraph();
  // console.log('date_point:'+date_point+' direct_point:'+direct_point+' traffic_point:'+traffic_point);
}

function direct(id) {
  $('#ALL').removeClass('active');
  $('#ABC').removeClass('active');
  $('#MGF').removeClass('active');
  $('#NOTMGF').removeClass('active');
  $('#INTER').removeClass('active');
  $('#INTRA').removeClass('active');
  $('#' + id).addClass('active');
  direct_point = id;
  loadgraph();
  // console.log('date_point:'+date_point+' direct_point:'+direct_point+' traffic_point:'+traffic_point);
}

function traffic(id) {
  $('#over').removeClass('active');
  $('#whole').removeClass('active');
  $('#b2c').removeClass('active');
  $('#b2b').removeClass('active');
  $('#trunk').removeClass('active');
  $('#stmb').removeClass('active');
  $('#emotion').removeClass('active');
  $('#emotion_ios').removeClass('active');
  $('#emotion_android').removeClass('active');
  $('#emotion_not').removeClass('active');
  $('#' + id).addClass('active');
  traffic_point = id;
  loadgraph();
  // console.log('date_point:'+date_point+' direct_point:'+direct_point+' traffic_point:'+traffic_point);
}

function magico(id) {
  magic_point = id;
  console.log('magico:' + magic_point);
  loadgraph();
}

function defaultChartConfig(data, oxLabelName) {
  return {
    type: 'bar',
    data: data || {},
    options: {
      legend: { display: true },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: oxLabelName
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              callback: function(label, index, labels) {
                // return label/1000+'k';
                return respace(label + ' 00');
              }
            },
            scaleLabel: {
              display: true,
              labelString: 'Минуты'
            }
          }
        ]
      },
      tooltips: {
        callbacks: {}
      }
    }
  };
}

function newlabels(period) {
  labels = [];
  let localMoment = moment();
  let day;

  switch (period) {
    case 'day':
      _.times(24, (i) => {
        labels.push({
          id: i + 1,
          caption: ('0' + (i + 1)).slice(-2)
        });
      });
      break;
    case 'week':
      _.times(7, (i) => {
        let curMoment = localMoment.clone().subtract(i + 1, 'days');
        labels.unshift({
          id: curMoment.format('D'),
          caption: curMoment.format('DD/MM/YYYY')
        });
      });
      break;
    case 'month':
      let end = Date.now();
      day = moment().subtract(' 1', 'month');

      while (day.valueOf() < end) {
        labels.push({
          id: day.format('YYYY-MM-DD'),
          caption: day.format('DD/MM/YYYY')
        });
        day = day.add(1, 'days');
      }
      break;
    case 'year':

      _.times(12, (i) => {
        let curMoment = i ? localMoment.clone().subtract(i, 'month') : localMoment;
        let month = curMoment.format('M');

        labels.unshift({
          id: month,
          caption: [
            'Январь',
            'Февраль',
            'Март',
            'Апрель',
            'Май',
            'Июнь',
            'Июль',
            'Август',
            'Сентябрь',
            'Октябрь',
            'Ноябрь',
            'Декабрь'
          ][month - 1]
        });
      });
      break;
    case 'custom':
      day = moment(custom_start).startOf('day');

      while (day.valueOf() < custom_end.getTime()) {
        labels.push({
          id: day.format('YYYY-MM-DD'),
          caption: day.format('DD/MM/YYYY')
        });
        day = day.add(1, 'days');
      }
      break;
  }
}

let chartsRequests = [];

let regionList = {
  '0': 'Region 0',
  '1': 'СЗФ',
  '2': 'Урал',
  '3': 'Сибирь',
  '4': 'Дальневосточный',
  '5': 'Центральный',
  '6': 'Столичный',
  '7': 'Поволжский',
  '8': 'Кавказский',
  '9': 'Region Undef'
};

function loadgraph() {
  // Cancel all current chart requests.
  _.each(chartsRequests, request => {
    request && request.abort && request.abort();
  });

  chartsRequests = [];

  $('.js-region-tables').empty();

  switchtype('bar', true);

  $('#legend').text(' ' + date_point + ' ' + direct_point + ' ' + traffic_point + ' ');
  $('#summa').text('МегаЛабс');
  $('#totals').html('<i class="fa fa-cog fa-spin fa-2x text-muted"></i>');
  $('#totals1').html('<i class="fa fa-cog fa-spin fa-2x text-muted"></i>');
  $('#totals2').html('<i class="fa fa-cog fa-spin fa-2x text-muted"></i>');
  $('#regionspread tr.written').remove();
  $('#regionspread_in tr.written').remove();


  initsql();

  let select_formula;

  // TRAFFIC DIRECTIONS MAGIC

  if (magic_point == 'ini') {
    select_traffic = ' and ';
    select_traffic += '  ((rec_type = 37 AND type_1_ser = \'11\' AND code_1_ser = \'01\')'; // to check (sip2sip)
    select_traffic += '    or ';
    select_traffic += '   (rec_type = 1))';
  }


  if (direct_point == 'ALL') {
    $('#direction_legend').text('Все направления - все набранные номера.');
  }

  if (direct_point == 'ABC') {
    select_traffic += ' and match(dialed, \'^7\') AND NOT match(dialed, \'^77|^79\')';
    $('#direction_legend').text('ABC - Все набранные номера, начинающиеся с 7 и не начинающиеся с 77 и 79.');
  }

  if (direct_point == 'MGF') {
    select_traffic += ' and match(dialed, \'^79[23]\')';
    $('#direction_legend').text('МегаФон - Все набранные номера, начинающиеся с 792 и 793.');
  }

  if (direct_point == 'NOTMGF') {
    select_traffic += ' and match(dialed, \'^79[01456789]\')';
    $('#direction_legend').text('не МегаФон - Все набранные номера, начинающиеся с 79 и далее одной из цифр 1 4 5 6 7 8 9.');
  }

  if (direct_point == 'INTER') {
    select_traffic += ' and match(dialed, \'^[12345689]|^77\')';
    $('#direction_legend').text('МЕЖДУНАРОДНЫЕ - Все набранные номера, начинающиеся с 77 или одной из цифр 1 2 3 4 5 6 8 9.');
  }

  if (direct_point == 'INTRA') {
    select_traffic = ' and rec_type = 37 AND type_1_ser = \'11\' AND code_1_ser = \'01\''; // to check (sip2sip)
    $('#direction_legend').text('Вызовы внутри МультиФон - sip-2-sip');
  }
  // TRAFFIC DIRECTIONS MAGIC -- ends here

  // TRAFFIC TYPE MAGIC
  if (traffic_point == 'over') {
  }

  if (traffic_point == 'whole') {
    $('#traffictype_legend').text('Весь трафик.');
  }

  if (traffic_point == 'b2c') {
    select_type = ' and business_type = 1';
    $('#traffictype_legend').text('Присутсвует признак типа бизнеса "единица".');
  }

  if (traffic_point == 'b2b') {
    // select_type = " and trunk_id = '0' AND business_type IN (2, 3)";
    // $('#traffictype_legend').text("Нулевоей идентификатор транка и признак типа бизнеса \"два\" или \"три\".");
    select_type = ' and (trunk_id = \'\' AND business_type = 2)';
    $('#traffictype_legend').text('Нулевоей идентификатор транка и признак типа бизнеса "два".');
  }

  if (traffic_point == 'trunk') {
    select_type = ' and ((trunk_id != \'\' AND business_type = 2) OR (stmb = 1))';
    $('#traffictype_legend').text('Выполняется одно из условий - установлен флаг STMB или одноременно транк не ноль и тип бизнеса 2');
  }

  if (traffic_point == 'stmb') {
    select_type = ' and stmb = 1';
    $('#traffictype_legend').text('Установлен флаг STMB');
  }

  if (traffic_point == 'emotion') {
    select_type = ' and match(useragent, \'eMotion\')';
    $('#traffictype_legend').text('Присутсвует описание софтфона eMotion');
    // not_emotion: 'not match(useragent, \'eMotion\')',
    // emotion_android: 'match(useragent, \'eMotion.*Android\')',
    // emotion_ios: 'match(useragent, \'eMotion.*iP(hone|ad|od)\')',
  }

  if (traffic_point == 'emotion_ios') {
    select_type = ' and match(useragent, \'eMotion.*iP(hone|ad|od)\')';
    $('#traffictype_legend').text('Присутсвует описание софтфона eMotion iOS');
    // not_emotion: 'not match(useragent, \'eMotion\')',
    // emotion_android: 'match(useragent, \'eMotion.*Android\')',
    // emotion_ios: 'match(useragent, \'eMotion.*iP(hone|ad|od)\')',
  }

  if (traffic_point == 'emotion_android') {
    select_type = ' and match(useragent, \'eMotion.*Android\')';
    $('#traffictype_legend').text('Присутсвует описание софтфона eMotion Android');
    // not_emotion: 'not match(useragent, \'eMotion\')',
    // emotion_android: 'match(useragent, \'eMotion.*Android\')',
    // emotion_ios: 'match(useragent, \'eMotion.*iP(hone|ad|od)\')',
  }

  if (traffic_point == 'emotion_not') {
    select_type = ' and not match(useragent, \'eMotion\')';
    $('#traffictype_legend').text('Не присутсвует описание софтфона eMotion');
    // not_emotion: 'not match(useragent, \'eMotion\')',
    // emotion_android: 'match(useragent, \'eMotion.*Android\')',
    // emotion_ios: 'match(useragent, \'eMotion.*iP(hone|ad|od)\')',
  }
  // TRAFFIC TYPE MAGIC -- ends here


  // DATE MAGICS
  let myDate = new Date();
  let myString = $.format.date(myDate, 'dd/MM/yyyy HH:mm');
  let myStringDate = $.format.date(myDate, 'dd/MM/yyyy');
  let myStringInterval = $.format.date(myDate, 'yyyy-MM-dd HH:mm:00');

  myCurrentDayOfMonth = $.format.date(myDate, 'dd');
  myCurrentMonth = $.format.date(myDate, 'MM');
  myPreorderSelectRule = '';
  myPreorderOrderRule = '';
  let oxLabelName = '';

  if (date_point == 'day') {
    myDate.setDate(myDate.getDate() - 0);
    myStringDate = $.format.date(myDate, 'dd/MM/yyyy');
    myStringInterval = $.format.date(myDate, 'yyyy-MM-dd 00:00:00');
    myDate.setDate(myDate.getDate() - 1);
    myString = $.format.date(myDate, 'dd/MM/yyyy') + ' (00:00) - ' + myStringDate + ' (00:00)';
    date_marker = 'toHour(start_time)';
    oxLabelName = 'Часы';
  }

  if (date_point == 'week') {
    myDate.setDate(myDate.getDate() - 0);
    myStringDate = $.format.date(myDate, 'dd/MM/yyyy');
    myStringInterval = $.format.date(myDate, 'yyyy-MM-dd 00:00:00');
    myDate.setDate(myDate.getDate() - 7);
    myString = $.format.date(myDate, 'dd/MM/yyyy') + ' (00:00) - ' + myStringDate + ' (00:00)';
    // date_marker = "toDayOfWeek(start_time)"; // number of weekdays
    date_marker = 'toDayOfMonth(start_time)'; // date of month
    myPreorderSelectRule = 'CASE WHEN toDayOfMonth(start_time) < ' + myCurrentDayOfMonth + ' THEN toDayOfMonth(start_time)+31 ELSE toDayOfMonth(start_time) END as presort,';
    myPreorderOrderRule = 'ORDER BY presort';

    oxLabelName = 'Дни на неделе';
  }

  if (date_point == 'month') {
    let momentEnd = moment();
    let momentStart = moment().subtract('1', 'month');
    myStringDate = momentEnd.format('DD/MM/YYYY 00:00:00');
    myStringInterval = momentEnd.format('YYYY-MM-DD 00:00:00');

    myString = momentStart.format('DD/MM/YYYY00:00:00') + ' - ' + myStringDate;

    myDate = momentStart.valueOf();
    date_marker = 'toDate(start_time)';

    oxLabelName = 'Дни месяца';
  }

  if (date_point == 'year') {
    myDate.setDate(myDate.getDate() - 0);
    myStringDate = $.format.date(myDate, 'dd/MM/yyyy');
    myStringInterval = $.format.date(myDate, 'yyyy-MM-dd 00:00:00');
    myDate.setYear(parseInt(myDate.getYear()) - 1 + parseInt(1900));
    myString = $.format.date(myDate, 'dd/MM/yyyy') + ' (00:00) - ' + myStringDate + ' (00:00)';
    date_marker = 'toMonth(start_time)';
    myPreorderSelectRule = 'CASE WHEN toMonth(start_time) <= ' + myCurrentMonth + ' THEN toMonth(start_time)+12 ELSE toMonth(start_time) END as presort,';
    myPreorderOrderRule = 'ORDER BY presort';
    oxLabelName = 'Месяцы в году';
  }

  if (date_point == 'custom') {
    myStringDate = $.format.date(custom_end, 'dd/MM/yyyy');
    myStringInterval = moment(custom_end).add('day', 1).format('YYYY-MM-DD 00:00:00');


    myString = $.format.date(custom_start, 'dd/MM/yyyy') + ' (00:00) - ' + moment(custom_end).add('day', 1).format('DD/MM/YYYY 00:00:00');
    date_marker = 'toDate(start_time)';
    oxLabelName = 'Заданный диапазон дат';

    myDate = custom_start;
  }

  newlabels(date_point);

  date_interval = ' and (start_time > \'' + $.format.date(myDate, 'yyyy-MM-dd 00:00:00') + '\' and start_time <= \'' + myStringInterval + '\') ';
  $('#timetime').text(myString);
  // DATE MAGICS - ends here

  // REGIONS
  // severozapad: 'region_id = 1',
  // ural: 'region_id = 2',
  // sibir: 'region_id = 3',
  // dalnvostok: 'region_id = 4',
  // center: 'region_id = 5',
  // stolica: 'region_id = 6',
  // povolzhe: 'region_id = 7',
  // kavkaz: 'region_id = 8',
  // unknown: 'region_id = 9',

  let dateMarkerAlias = date_marker ? date_marker + ' AS date_marker' : '';

  if (magic_point == 'ini') {
    select_formula = 'select ' + myPreorderSelectRule + dateMarkerAlias +
      ',sum(ceil(duration/60)) as minutes, ceil(sum(duration/60)) as minuu from default.merged_data where duration >= 3' +
      select_traffic + select_type + date_interval + ' group by date_marker ' + myPreorderOrderRule + ' FORMAT JSON';
    select_formula_2 = 'select sum(ceil(duration/60)) as summa from default.merged_data where duration >= 3 ' + select_traffic + select_type + date_interval;
    ' FORMAT JSON';

    console.log(select_formula);
    console.log(select_formula_2);
  }

  if (magic_point == 'inn') {
    select_formula_01 = 'select ' + myPreorderSelectRule + dateMarkerAlias + ', sum(ceil(duration/60)) as summm from default.merged_data where duration >= 3 and rec_type = 1' + select_traffic + select_type + date_interval + ' group by date_marker ' + myPreorderOrderRule + ' FORMAT JSON';
    select_formula_02 = 'select ' + myPreorderSelectRule + dateMarkerAlias + ', sum(ceil(duration/60)) as summm from default.merged_data where duration >= 3 and rec_type = 2' + select_traffic + select_type + date_interval + ' group by date_marker ' + myPreorderOrderRule + ' FORMAT JSON';
    console.log(select_formula_01);
    console.log(select_formula_02);
  }


  let select_formula_reg_io = function(rec_type) {
    return 'select region_id, ' + date_marker + ' as date_marker , sum(ceil(duration/60)) as billed_minutes ' +
      'from default.merged_data ' +
      'where duration >= 3 and rec_type = ' + rec_type + ' ' + select_traffic + select_type + date_interval +
      'GROUP BY date_marker, region_id ORDER BY date_marker, region_id FORMAT JSON';
  };

  let select_formula_out_reg = select_formula_reg_io(1);

  console.log('select_formula_out_reg: ', select_formula_out_reg);

  let select_formula_in_reg = select_formula_reg_io(2);

  console.log('select_formula_in_reg: ', select_formula_in_reg);

  let select_formula_compare_minutes = 'select region_id, ' + dateMarkerAlias +
    ',sum(ceil(duration/60)) as minutes, ceil(sum(duration/60)) as minutes0 from default.merged_data where duration >= 3' +
    select_traffic + select_type + date_interval +
    ' GROUP BY date_marker, region_id ORDER BY date_marker, region_id FORMAT JSON';

  console.log('select_formula_compare_minutes: ', select_formula_compare_minutes);

  $('#chart1').remove(); // this is my <canvas> element
  $('#chartc').append('<img id="chart1" width="400px;" src=da_files/spinner.gif>');

  let selects = magic_point == 'ini' ? [select_formula_compare_minutes] : [
    select_formula_in_reg,
    select_formula_out_reg
  ];
  let regionLabels = magic_point == 'ini' ? ['Оплаченные минуты', 'Полные минуты разговора']
    : ['outSIP-2-GSM (минуты)', 'inGSM-2-SIP (минуты)'];

  let itemProcessor;
  let drawMainSet;

  if (magic_point == 'ini') {
    itemProcessor = function(item, regionArray, index, i) {
      regionArray[index] = {
        leftBar: item.minutes,
        rightBar: item.minutes0
      };
    };

    $('#totals2').html('');
    $('#totals1').html('');
    $('#totals').html('');

    drawMainSet = drawMainSet1;
  }
  else {
    itemProcessor = function(item, regionArray, index, i) {
      regionArray[index][i ? 'leftBar' : 'rightBar'] = item.billed_minutes;
    };

    drawMainSet = drawMainSet2;
  }


  let $miniCharts = $('.js-mini-charts').empty();

  let miniChartsRequests = selects.map(function(select) {
    return $.ajax({
      url: 'http://192.168.1.78:8123/?add_http_cors_header=1&log_queries=1&database=default&max_result_rows=5000&result_overflow_mode=throw',
      type: 'post',
      dataType: 'json',
      data: select
    });
  });

  chartsRequests.push(...miniChartsRequests);

  function fillBarArray(arr) {
    _.times(labels.length, () => {
      arr.push({
        leftBar: 0,
        rightBar: 0
      });
    });
  }

  function drawChart(data, ctx) {
    let leftDatasetData = [];
    let rightDatasetData = [];

    data.forEach(function(item) {
      leftDatasetData.push({ y: item.leftBar });
      rightDatasetData.push({ y: item.rightBar });
    });


    let cfg = defaultChartConfig({
      labels: _.map(labels, (label) => label.caption),
      datasets: [
        {
          label: regionLabels[0],
          data: leftDatasetData,
          type: gtype,
          pointRadius: 5,
          radius: 5,
          backgroundColor: color1,
          borderColor: color1,
          hoverRadius: 6,
          fill: false,
          lineTension: 0,
          borderWidth: 2
        },
        {
          label: regionLabels[1],
          data: rightDatasetData,
          type: gtype,
          pointRadius: 5,
          radius: 5,
          backgroundColor: color2,
          borderColor: color2,
          hoverRadius: 6,
          fill: false,
          lineTension: 0,
          borderWidth: 2
        }
      ]
    }, '');

    cfg.options.scales.xAxes[0].ticks = { display: false };
    cfg.options.scales.xAxes[0].gridLines = {
      tickMarkLength: 0
    };
    cfg.options.scales.yAxes[0].gridLines = {
      tickMarkLength: 0
    };
    cfg.options.scales.yAxes[0].ticks = { display: false };
    cfg.options.scales.yAxes[0].scaleLabel = { display: false };
    cfg.options.legend = { display: false };

    cfg.options.tooltips.callbacks = {
      label: function(tooltipItem, data) {
        return data.datasets[tooltipItem.datasetIndex].label + ': ' + respace(tooltipItem.yLabel + ' 00');
      }
    };

    new Chart(ctx, cfg);
  }

  Promise.all(miniChartsRequests).then(function(args) {
    let datas = _.map(args, (arg) => arg.data || []);

    let regionData = {};

    _.each(regionList, (item, i) => {
      regionData[i] = [];
      fillBarArray(regionData[i]);
    });

    let summaryData = [];
    fillBarArray(summaryData);

    datas.forEach((data, i) => {
      data.forEach(function(item) {
        let index = _.findIndex(labels, (label) => {
          // console.log('label',item.date_marker);
          return label.id == item.date_marker;
        });

        if (index < 0) {
          return;
        }

        itemProcessor(item, regionData[item.region_id], index, i);
      });
    });

    for (let region in regionData) {
      let summleftbar = 0;
      let summrightbar = 0;

      regionData[region].forEach((item, index) => {
        summleftbar += item.leftBar;
        summrightbar += item.rightBar;

        summaryData[index].leftBar += item.leftBar;
        summaryData[index].rightBar += item.rightBar;
      });

      let $chartWrap =
        $('<table style="width:100%;max-height:200px;">' +
          ' <tr><td style="width:340px;">     <div class="col-4" style="min-width:200px;max-width:340px;min-height200px;">    <canvas class="js-mini-chart" ></canvas>  </div></td><td style="vertical-align:top;">  <div class="js-caption caption" style="min-width:50px;text-align:left;"></div>  ' +
          '<table class="regiontable">' +
          '<tr><td style="text-align:right;">Исходящих:</td><td style="color:' + color1 + ';text-align:right;">' + respace(summleftbar) + '</td></tr>    ' +
          '<tr><td style="text-align:right;">Входящих:</td> <td style="color:' + color2 + ';text-align:right;">' + respace(summrightbar) + '</td></tr>    ' +
          '<tr><td style="text-align:right;"></td>          <td style="color:white;text-align:right;">000 000 000</td></tr>  ' +
          '</table>' +
          '</td></tr></table>');

      let trrow = '<tr class="written">' +
        '<td>' + regionList[region] + '</td>' +
        '<td class="summleftbar" style="text-align:right;">' + respace(summleftbar + ' 00') + '</td>' +
        '<td class="leftpercent"></td>' +
        '<td class="leftpercent_line"><span class="line" data-peity=\'{ "fill": ["' + color1 + '"], "width":10}\'>5,5,5,5,5,5</span></td>' +

        '<td class="summrightbar" style="text-align:right;">' + respace(summrightbar + ' 00') + '</td>' +
        '<td class="rightpercent"></td>' +
        '<td class="rightpercent_line"><span class="line" data-peity=\'{ "fill": ["' + color2 + '"], "width":10}\'>5,5,5,5,5,5</span></td>' +

        '<td class="in_out_percents" style="text-align:right;">' +
        (summleftbar / (summrightbar + summleftbar) * 100).toFixed(0) + '% / ' +
        (summrightbar / (summrightbar + summleftbar) * 100).toFixed(0) + '%</td>' +
        '<td class="in_out_ring">' +
        '<span class="donut" data-peity=\'{ "fill": ["' + color1 + '","' + color2 + '"], "innerRadius": 5, "radius": 20, "width":20, "height":20}\'>' +
        (summleftbar / (summrightbar + summleftbar) * 100).toFixed(0) + '/' +
        (summrightbar / (summrightbar + summleftbar) * 100).toFixed(0) + '</span>' +
        '</td>' +
        +'</tr>';

      $('#regionspread tr:last').after(trrow);
      $('#regionspread_in tr:last').after(trrow);

      let ctx = $chartWrap.find('.js-mini-chart').get(0).getContext('2d');
      $chartWrap.find('.js-caption').html(regionList[region]);
      $miniCharts.append($chartWrap);

      drawChart(regionData[region], ctx);
    }

    // Turn on region tables by adding regTable=true to query.
    showRegTables && regionTables(regionData, regionLabels);

    let $canvas = $('<canvas class="chart1" id="chart1" ></canvas>');
    $('#chartc').empty().append($canvas);
    let ctxMain = $canvas.get(0).getContext('2d');
    drawMainSet(summaryData, ctxMain, { oxLabelName: oxLabelName });

    sorttable('#regionspread', 1);
    sorttable('#regionspread_in', 4);
    $('.donut').peity('donut');
    $('.line').peity('line');

    addsumm('#regionspread');
    addsumm('#regionspread_in');
    calcpercentstable('#regionspread');
    calcpercentstable('#regionspread_in');
  });
}

// ini
function drawMainSet1(data, ctx, options = {}) {
  let leftDatasetData = [];
  let rightDatasetData = [];

  data.forEach(function(item) {
    leftDatasetData.push({ y: item.leftBar });
    rightDatasetData.push({ y: item.rightBar });
  });

  let cfg = {
    type: 'bar',
    data: {
      labels: _.map(labels, (label) => label.caption),
      datasets: [
        {
          label: 'Оплаченные минуты',
          data: leftDatasetData,
          type: gtype,
          pointRadius: 5,
          radius: 5,
          backgroundColor: color1,
          borderColor: color1,
          hoverRadius: 6,
          fill: false,
          lineTension: 0,
          borderWidth: 2
        }, {
          label: 'Полные минуты разговора',
          data: rightDatasetData,
          type: gtype,
          backgroundColor: color2,
          borderColor: color2,
          pointRadius: 5,
          radius: 5,
          hoverRadius: 6,
          fill: false,
          lineTension: 0,
          borderWidth: 2
        }
      ]
    },
    options: {
      legend: { display: true }, // false?true
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: true,
              labelString: options.oxLabelName
            }
          }
        ],
        yAxes: [
          {
            ticks: {
              callback: function(label, index, labels) {
                // return label/1000+'k';
                return respace(label + ' 00');
              }
            },
            scaleLabel: {
              display: true,
              labelString: 'Минуты'
            }
          }
        ]
      },
      tooltips: {
        callbacks: {
          label: function(tooltipItem, data) {
            return data.datasets[tooltipItem.datasetIndex].label + ': ' + respace(tooltipItem.yLabel);
          }
        }
      }
    }
  };


  let chart = new Chart(ctx, cfg);
  $(chart.canvas).data('chart', chart);

  $('#timeblock').show();
  $('#switcher').show();

  let request = $.ajax({
    url: 'http://192.168.1.78:8123/?add_http_cors_header=1&log_queries=1&database=default&max_result_rows=5000&result_overflow_mode=throw',
    type: 'post',
    data: select_formula_2,
    success: function(rawData) {
      rawData += '00';
      rawData = rawData.replace(new RegExp('^(\\d{' + (rawData.length % 3 ? rawData.length % 3 : 0) + '})(\\d{3})', 'g'), '$1 $2').replace(/(\d{3})+?/gi, '$1 ').trim();
      rawData = rawData.replace(/00$/, '');
      $('#summa').text(rawData + ' оплаченных минут суммарно');
    }
  });

  chartsRequests.push(request);
}

// inn
function drawMainSet2(data, ctx, options = {}) {
  let leftDatasetData = [];
  let rightDatasetData = [];
  let sumLeft = 0;
  let sumRight = 0;
  let minLeft = 0;
  let maxLeft = 0;
  let minRight = 0;
  let maxRight = 0;

  data.forEach(function(item) {
    sumLeft += item.leftBar;
    sumRight += item.rightBar;

    minLeft = Math.min(minLeft, item.leftBar);
    maxLeft = Math.max(maxLeft, item.leftBar);
    minRight = Math.min(minLeft, item.rightBar);
    maxRight = Math.max(maxRight, item.rightBar);

    leftDatasetData.push({ y: item.leftBar });
    rightDatasetData.push({ y: item.rightBar });
  });

  let cfg = defaultChartConfig({
    labels: _.map(labels, (label) => label.caption),
    datasets: [
      {
        label: 'outSIP-2-GSM (минуты)',
        data: leftDatasetData,
        type: gtype,
        pointRadius: 5,
        radius: 5,
        backgroundColor: color1,
        borderColor: color1,
        hoverRadius: 6,
        fill: false,
        lineTension: 0,
        borderWidth: 2
      },
      {
        label: 'inGSM-2-SIP (минуты)',
        data: rightDatasetData,
        type: gtype,
        pointRadius: 5,
        radius: 5,
        backgroundColor: color2,
        borderColor: color2,
        hoverRadius: 6,
        fill: false,
        lineTension: 0,
        borderWidth: 2
      }
    ]
  },
  options.oxLabelName
  );

  cfg.options.tooltips.callbacks = {
    label: function(tooltipItem, data) {
      return data.datasets[tooltipItem.datasetIndex].label + ': ' + respace(tooltipItem.yLabel + ' 00');
    }
  };

  let chart = new Chart(ctx, cfg);
  $(chart.canvas).data('chart', chart);

  function leftPart(localsumm, min, max) {
    let locatitle = chart.data.datasets[0].label;
    // +', '+traffic_point.replace(/whole/,'все типы');
    let localavg = respace(Math.floor(localsumm / labels.length) + ' 00');
    $('#totalminutes').text(localsumm);
    localsumm = respace(localsumm + ' 00');
    let localperiod = $('#timetime').text().replace(/\(00:00\)/g, '') + ', ' + traffic_point;
    localperiod = localperiod.replace(/whole/, 'все типы трафика');
    localperiod = localperiod.replace(/stmb/, 'trunc - пучки направлений');
    localperiod += '</br>' + $('#direction_legend').text();

    let localmin = respace(min + ' 00');
    let localmax = respace(max + ' 00');

    let localsummstring = 'за ';
    let localperiodstring = 'за ';
    switch (date_point) {
      case 'day':
        localsummstring = localsummstring + 'день';
        localperiodstring = localperiodstring + 'час';
        break;
      case 'week':
        localsummstring = localsummstring + 'неделю';
        localperiodstring = localperiodstring + 'день';
        break;
      case 'custom':
        localsummstring = localsummstring + 'период';
        localperiodstring = localperiodstring + 'день';
        break;
      case 'month':
        localsummstring = localsummstring + 'месяц';
        localperiodstring = localperiodstring + 'день';
        break;
      case 'year':
        localsummstring = localsummstring + 'год';
        localperiodstring = localperiodstring + 'месяц';
        break;
    }


    $('#summa').html(
      '<p>' + localperiod + '</p>' +
      '<h3>' + locatitle + '</h3>' +
      '<table style="width:100%;">' +
      '<tr><td>Сумма ' + localsummstring + ':</td><td style="text-align:right;">' + localsumm + '</td></tr>' +
      '<tr><td>Минимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmin + '</td></tr>' +
      '<tr><td>Максимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmax + '</td></tr>' +
      '<tr><td>Среднее ' + localperiodstring + ':</td><td style="text-align:right;">' + localavg + '</td></tr>' +
      '</table>'
    );
    $('#totals1').html(
      '<h3>' + locatitle + '</h3>' +
      '<table style="width:100%;">' +
      '<tr class="headline"><td>Сумма ' + localsummstring + ':</td><td style="text-align:right;">' + localsumm + '</td></tr>' +
      '<tr class="headline"><td>Минимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmin + '</td></tr>' +
      '<tr class="headline"><td>Максимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmax + '</td></tr>' +
      '<tr class="headline"><td>Среднее ' + localperiodstring + ':</td><td style="text-align:right;">' + localavg + '</td></tr>' +
      '</table>'
    );
  }

  function rightPart(localsumm, min, max) {
    let localavg = respace(Math.floor(localsumm / labels.length) + ' 00');
    let localtotalminutes = respace(parseInt($('#totalminutes').text()) + localsumm);
    localsumm = respace(localsumm + ' 00');
    let locatitle = chart.data.datasets[1].label;

    let localmin = respace(min + ' 00');
    let localmax = respace(max + ' 00');

    let localsummstring = 'за ';
    let localperiodstring = 'за ';
    switch (date_point) {
      case 'day':
        localsummstring = localsummstring + 'день';
        localperiodstring = localperiodstring + 'час';
        break;
      case 'week':
        localsummstring = localsummstring + 'неделю';
        localperiodstring = localperiodstring + 'день';
        break;
      case 'month':
        localsummstring = localsummstring + 'месяц';
        localperiodstring = localperiodstring + 'день';
        break;
      case 'custom':
        localsummstring = localsummstring + 'период';
        localperiodstring = localperiodstring + 'день';
        break;
      case 'year':
        localsummstring = localsummstring + 'год';
        localperiodstring = localperiodstring + 'месяц';
        break;
    }

    $('#summa').html(
      $('#summa').html() + ' </br>' +
      '<h3>' + locatitle + '</h3>' +
      '<table style="width:100%;">' +
      '<tr><td>Сумма ' + localsummstring + ':</td><td style="text-align:right;">' + localsumm + '</td></tr>' +
      '<tr><td>Минимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmin + '</td></tr>' +
      '<tr><td>Максимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmax + '</td></tr>' +
      '<tr><td>Среднее ' + localperiodstring + ':</td><td style="text-align:right;">' + localavg + '</td></tr>' +
      '</table>' +
      '</br><h3>Вместе </h3>' +
      '<table style="width:100%;">' +
      '<tr><td>Сумма ' + localsummstring + ':</td><td style="text-align:right;">' + localtotalminutes + '</td></tr>' +
      '</table>'
    );
    $('#totals2').html(
      '<h3>' + locatitle + '</h3>' +
      '<table style="width:100%;">' +
      '<tr class="headline"><td>Сумма ' + localsummstring + ':</td><td style="text-align:right;">' + localsumm + '</td></tr>' +
      '<tr class="headline"><td>Минимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmin + '</td></tr>' +
      '<tr class="headline"><td>Максимально ' + localperiodstring + ':</td><td style="text-align:right;">' + localmax + '</td></tr>' +
      '<tr class="headline"><td>Среднее ' + localperiodstring + ':</td><td style="text-align:right;">' + localavg + '</td></tr>' +
      '</table>'
    );
    $('#totals').html(
      '<h3>Вместе </h3>' +
      '<table style="width:100%;">' +
      '<tr class="headline"><td>Сумма ' + localsummstring + '</td></tr>' +
      '<tr class="headline"><td style="text-align:left;">' + localtotalminutes + '</td></tr>' +
      '</table>'
    );

    $('#timeblock').show();
    $('#switcher').show();
  }

  leftPart(sumLeft, minLeft, maxLeft);
  rightPart(sumRight, minRight, maxRight);
}

function regionTables(regionData, regionLabels) {
  let $container = $('.js-region-tables');
  $container.empty();

  let $leftTbody = $('<tbody>');
  let $rightTbody = $('<tbody>');

  _.each(labels, (label, index) => {
    let trLeft = `<tr><td>${label.caption}</td>`;
    let trRight = `<tr><td>${label.caption}</td>`;

    _.each(regionData, (regionData0, region) => {
      trLeft += `<td>${regionData0[index].leftBar}</td>`;
      trRight += `<td>${regionData0[index].rightBar}</td>`;
    });

    $leftTbody.append(trLeft + '</tr>');
    $rightTbody.append(trRight + '</tr>');
  });

  $container.append(`<h3>${regionLabels[0]}</h3>`);
  $container.append($('<table class="table stat-table">').append(regionTableHead()).append($leftTbody));
  $container.append(`<h3>${regionLabels[1]}</h3>`);
  $container.append($('<table class="table stat-table">').append(regionTableHead()).append($rightTbody));
}

function regionTableHead() {
  let $thead = $('<tr class="bg-primary"><th>Дата</th></tr></thead>');

  _.each(regionList, (regionName) => {
    $thead.append($('<th>').text(regionName));
  });

  return $('<thead>').append($thead);
}

function switchtype(type, noUpdate) {
  $('#downloadbutton').hide('slow');
  $('#tframe').hide('slow');
  $('#pframe').hide('slow');
  $('#iframe').show('slow');
  $('#summa').show('slow');
  $('#spock').show('slow');

  gtype = type;

  if (noUpdate) {
    return;
  }

  let chart = $('#chart1').data('chart');

  chart.config.data.datasets[0].type = type;
  chart.config.data.datasets[1].type = type;
  chart.update();
}

function downloadCSV(csv, filename) {
  let csvFile;
  let downloadLink;

  // CSV file
  csvFile = new Blob([csv], { data: 'text/csv;charset=utf-8;' });
  // csvFile = new Blob([csv], {data: "text/csv;charset=utf-8,%EF%BB%BF"});
  // csvFile = new Blob([csv], {type: "text/csv;charset=utf-8,%EF%BB%BF,"});
  // csvFile = new Blob([csv], {type: "text/csv;charset=utf-8"});
  // csvFile = new Blob([csv], {data: "text/csv;charset=utf-8"});
  // csvFile = new Blob([csv], {type: "data:text/csv;charset=utf-8"});
  // csvFile = new Blob([csv], {type: "data:text/csv;charset=utf-8,%EF%BB%BF,"});

  // Download link
  downloadLink = document.createElement('a');

  // File name
  downloadLink.download = filename;

  // Create a link to the file
  downloadLink.href = window.URL.createObjectURL(csvFile);
  // downloadLink.setAttribute("href","data:text/csv;charset=utf-8,%EF%BB%BF");

  // Hide download link
  downloadLink.style.display = 'none';

  // Add the link to DOM
  document.body.appendChild(downloadLink);

  // Click download link
  downloadLink.click();
}

function exportTableToCSV(filename) {
  let csv = [];
  let rows = document.querySelectorAll('table tr');

  for (let i = 0; i < rows.length; i++) {
    let row = [];
    let cols = rows[i].querySelectorAll('td, th');

    for (let j = 0; j < cols.length; j++) {row.push(cols[j].innerText);}
    // row.push(encodeURIComponent(cols[j].innerText));

    csv.push(row.join(';'));
  }

  // https://stackoverflow.com/questions/19492846/javascript-to-csv-export-encoding-issue

  // Download CSV file
  // downloadCSV('data:text/csv;charset=utf-8,%EF%BB%BF'+encodeURIComponent(csv.join("\n")), filename);
  // downloadCSV('data:text/csv;charset=utf-8,%EF%BB%BF'+csv.join("\n"), filename);
  downloadCSV(csv.join('\n'), filename);
}


function sorttable(is, col) {
  let table = $(is).eq(0);
  let rows = $(is).find('tr:gt(1)').toArray().sort(comparer(col));
  rows = rows.reverse();

  for (let i = 0; i < rows.length; i++) {
    table.append(rows[i]);
  }
}

function comparer(index) {
  return function(a, b) {
    let valA = getCellValue(a, index);
    let valB = getCellValue(b, index);

    return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.localeCompare(valB);
  };
}

function getCellValue(row, index) {
  // console.log('getCellValue:'+$(row).children('td').eq(index).text());
  return $(row).children('td').eq(index).text().replace(/\s+/g, '');
}

function addsumm(t) {
  let lsum = 0;
  $(t + ' tbody tr td.summleftbar').each(function() {
    let value = $(this).text().replace(/\s+/g, '');

    if (!isNaN(value) && value.length != 0) {
      lsum += parseFloat(value);
      // console.log('left string:'+value);
    }
  });
  let rsum = 0;
  $(t + ' tbody tr td.summrightbar').each(function() {
    let value = $(this).text().replace(/\s+/g, '');

    if (!isNaN(value) && value.length != 0) {
      rsum += parseFloat(value);
    }
  });
  console.log('lsum:' + lsum + 'rsum:' + rsum);
  $(t + ' tr:last').after('<tr class="written">' +
    '<td>Итого:</td>' +
    '<td style="text-align:right;color:' + color1 + ';" class="leftsum">' + respace(lsum + ' 00') + '</td>' +
    '<td class="leftpercent" style="color:white;"></td>' +
    '<td class="leftpercent_line"></td>' +
    '<td style="text-align:right;color:' + color2 + ';" class="rightsum">' + respace(rsum + ' 00') + '</td>' +
    '<td class="rightpercent" style="color:white;"></td>' +
    '<td class="rightpercent_line"></td>' +
    '<td class="in_out_percents"></td>' +
    '<td class="in_out_ring"></td>' +
    +'</tr>');
}

function calcpercentstable(t) {
  let table = $(t).eq(0);
  let lsum = $(t).find('.leftsum').text().replace(/\s+/g, '');
  // console.log('L SUM:'+lsum);
  // console.log('R SUM:'+rsum);
  let rows = $(t).find('tr:gt(1)').toArray();

  for (let i = 0; i < rows.length; i++) {
    let leftpercent = ($(rows[i]).find('.summleftbar').text().replace(/\s+/g, '') / lsum * 100).toFixed(0);
    let rightpercent = ($(rows[i]).find('.summrightbar').text().replace(/\s+/g, '') / lsum * 100).toFixed(0);
    $(rows[i]).find('.leftpercent').text(leftpercent + '%');
    $(rows[i]).find('.rightpercent').text(rightpercent + '%');

    $(rows[i]).find('.leftpercent_line .line').peity('line', { width: leftpercent * 3 });
    $(rows[i]).find('.rightpercent_line .line').peity('line', { width: rightpercent * 3 });

    table.append(rows[i]);
  }
}
