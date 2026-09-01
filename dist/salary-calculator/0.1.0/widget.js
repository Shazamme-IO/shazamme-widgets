/* shazamme-widgets — shazamme-widgets v0.1.0
 * Built 2026-09-01T06:12:02.556Z. Registers window.ShazammeWidget["<name>"].
 */

var __shazWidgetExport = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // dist/.gen/salary-calculator.index.js
  var salary_calculator_index_exports = {};
  __export(salary_calculator_index_exports, {
    default: () => legacyController
  });

  // core/script-loader.ts
  var CANONICAL_SDK_URL = "https://sdk.shazamme.io/js/shazamme-1.0.3.min.js";
  var SDK_URL_RE = /shazamme(-1\.0\.\d+(-test)?)?\.min\.js/;
  function injectScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error(`Failed to load ${src}`));
      (document.head || document.documentElement).appendChild(s);
    });
  }
  function loadSdk() {
    if (window.__shazSDKPromise) return window.__shazSDKPromise;
    const p = window.shazamme ? Promise.resolve() : injectScript(CANONICAL_SDK_URL);
    window.__shazSDKPromise = p;
    return p;
  }
  function loadOther(src) {
    const cache = window.__shazScriptCache = window.__shazScriptCache || {};
    const existing = cache[src];
    if (existing) return existing;
    const p = injectScript(src).catch((err) => {
      delete cache[src];
      throw err;
    });
    cache[src] = p;
    return p;
  }
  function installScriptLoader() {
    if (typeof window === "undefined" || window.__shazLoadScript) return;
    window.__shazLoadScript = (src) => SDK_URL_RE.test(src) ? loadSdk() : loadOther(src);
  }
  function ensureScriptLoader() {
    installScriptLoader();
  }

  // dist/.gen/salary-calculator.index.js
  function legacyController(ctx) {
    ensureScriptLoader();
    var data = ctx.data, element = ctx.element, $ = ctx.$ || window.jQuery || window.$, shazamme = ctx.shazamme || window.shazamme;
    var Layouts = data.config.layouttypes;
    var locations = data.config.locdropdown;
    var duration = data.config.yeartxt;
    var Weekly = data.config.weeklytxt;
    var Fortnightly = data.config.fornighttxt;
    var Monthly = data.config.monthlytxt;
    var Anually = data.config.anuallytxt;
    var pay = data.config.paytxt;
    var income = data.config.incometxt;
    var annuation = data.config.annuationtxt;
    var cmonthly = data.config.cmonthlytxt;
    var tax = data.config.taxtxt;
    var dailyhrs = data.config.dailyhourtxt;
    var fornightyhrs = data.config.fornightlyhourtxt;
    var monthlyhrs = data.config.monthlyhourtxt;
    var yearlyhrs = data.config.yearlyhourtxt;
    var ausdailyhrs = data.config.ausdailyhourtxt;
    var ausfornightyhrs = data.config.ausfornightlyhourtxt;
    var ausmonthlyhrs = data.config.ausmonthlyhourtxt;
    var ausyearlyhrs = data.config.ausyearlyhourtxt;
    function recomputeHours() {
      var cfgD, cfgF, cfgM, cfgY;
      if (locations == "aus") {
        cfgD = data.config.ausdailyhourtxt;
        cfgF = data.config.ausfornightlyhourtxt;
        cfgM = data.config.ausmonthlyhourtxt;
        cfgY = data.config.ausyearlyhourtxt;
      } else {
        cfgD = data.config.dailyhourtxt;
        cfgF = data.config.fornightlyhourtxt;
        cfgM = data.config.monthlyhourtxt;
        cfgY = data.config.yearlyhourtxt;
      }
      var baseDaily = parseFloat(cfgD);
      if (isNaN(baseDaily) || baseDaily <= 0) baseDaily = 8;
      var elId = data.device == "mobile" ? "hoursPerDaymobile" : "hoursPerDay";
      var elh = document.getElementById(elId);
      var Hraw = elh ? parseFloat(elh.value) : NaN;
      var H = !isNaN(Hraw) && Hraw > 0 ? Hraw : baseDaily;
      var dF = (parseFloat(cfgF) || 0) / baseDaily;
      var dM = (parseFloat(cfgM) || 0) / baseDaily;
      var dY = (parseFloat(cfgY) || 0) / baseDaily;
      if (locations == "aus") {
        ausdailyhrs = H;
        ausfornightyhrs = H * dF;
        ausmonthlyhrs = H * dM;
        ausyearlyhrs = H * dY;
      } else {
        dailyhrs = H;
        fornightyhrs = H * dF;
        monthlyhrs = H * dM;
        yearlyhrs = H * dY;
      }
    }
    (function initHoursPerDay() {
      var cfgD = locations == "aus" ? data.config.ausdailyhourtxt : data.config.dailyhourtxt;
      var baseDaily = parseFloat(cfgD);
      if (isNaN(baseDaily) || baseDaily <= 0) baseDaily = 8;
      var ids = ["hoursPerDay", "hoursPerDaymobile"];
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el && el.value === "") el.value = baseDaily;
      }
    })();
    $("#hoursPerDay, #hoursPerDaymobile").on("keyup change", function() {
      recomputeHours();
      if (Layouts == "layout1") {
        $("#hourlyRate, #hourlyRatemobile, #currentannual, #currentannualmobile").trigger("keyup");
      } else {
        $("#yourpay, #yourpaymobile").trigger("keyup");
      }
    });
    if (data.config.supertoggle === true) {
      element.querySelectorAll(
        ".supermaincls, .supercls, #hourlySuper, #dailySuper, #monthlySuper, #yearlySuper,#hourlySuper1, #dailySuper1, #monthlySuper1, #yearlySuper1,#hourlySupermobile,#dailySupermobile,#monthlySupermobile,#yearlySupermobile,#hourlySuper1mobile,#dailySuper1mobile,#monthlySuper1mobile,#yearlySuper1mobile,.lesssupermaincls, .superheadercls"
      ).forEach(function(el) {
        el.style.display = "none";
      });
    }
    if (data.config.totalstoggle === true) {
      element.querySelectorAll(
        ".totalheadercls,#hourlyTotal, #dailyTotal,#monthlyTotal,#yearlyTotal,#hourlyTotal1,#dailyTotal1,#monthlyTotal1,#yearlyTotal1,#hourlyTotalmobile,#dailyTotalmobile,#monthlyTotalmobile,#yearlyTotalmobile,#hourlyTotal1mobile,#dailyTotal1mobile,#fortnightlyTotal1mobile,#monthlyTotal1mobile,#yearlyTotal1mobile"
      ).forEach(function(el) {
        el.style.display = "none";
      });
    }
    var hourly1_toggle = data.config.hourlyresulttoggle;
    var hourlyrow1 = document.getElementById("hourlyrow1");
    var hourlyrow2 = document.getElementById("hourlyrow2");
    var hourlyrow3 = document.getElementById("hourlyrow3");
    var hourlyrow4 = document.getElementById("hourlyrow4");
    var isOn = hourly1_toggle === true || hourly1_toggle === "on" || hourly1_toggle === "true";
    if (hourlyrow1) {
      hourlyrow1.style.display = isOn ? "" : "none";
    }
    if (hourlyrow2) {
      hourlyrow2.style.display = isOn ? "" : "none";
    }
    if (hourlyrow3) {
      hourlyrow3.style.display = isOn ? "" : "none";
    }
    if (hourlyrow4) {
      hourlyrow4.style.display = isOn ? "" : "none";
    }
    var daily1_toggle = data.config.dailyresulttoggle;
    var dailyrow1 = document.getElementById("dailyrow1");
    var dailyrow2 = document.getElementById("dailyrow2");
    var dailyrow3 = document.getElementById("dailyrow3");
    var dailyrow4 = document.getElementById("dailyrow4");
    var isOn = daily1_toggle === true || daily1_toggle === "on" || daily1_toggle === "true";
    if (dailyrow1) {
      dailyrow1.style.display = isOn ? "" : "none";
    }
    if (dailyrow2) {
      dailyrow2.style.display = isOn ? "" : "none";
    }
    if (dailyrow3) {
      dailyrow3.style.display = isOn ? "" : "none";
    }
    if (dailyrow4) {
      dailyrow4.style.display = isOn ? "" : "none";
    }
    var fornighty1_toggle = data.config.fornightyresulttoggle;
    var fornighyrow1 = document.getElementById("fornighyrow1");
    var fornighyrow2 = document.getElementById("fornighyrow2");
    var fornighyrow3 = document.getElementById("fornighyrow3");
    var fornighyrow4 = document.getElementById("fornighyrow4");
    var isOn = fornighty1_toggle === true || fornighty1_toggle === "on" || fornighty1_toggle === "true";
    if (fornighyrow1) {
      fornighyrow1.style.display = isOn ? "" : "none";
    }
    if (fornighyrow2) {
      fornighyrow2.style.display = isOn ? "" : "none";
    }
    if (fornighyrow3) {
      fornighyrow3.style.display = isOn ? "" : "none";
    }
    if (fornighyrow4) {
      fornighyrow4.style.display = isOn ? "" : "none";
    }
    var monthly1_toggle = data.config.monthlyresulttoggle;
    var monthlyrow1 = document.getElementById("monthlyrow1");
    var monthlyrow2 = document.getElementById("monthlyrow2");
    var monthlyrow3 = document.getElementById("monthlyrow3");
    var monthlyrow4 = document.getElementById("monthlyrow4");
    var isOn = monthly1_toggle === true || monthly1_toggle === "on" || monthly1_toggle === "true";
    if (monthlyrow1) {
      monthlyrow1.style.display = isOn ? "" : "none";
    }
    if (monthlyrow2) {
      monthlyrow2.style.display = isOn ? "" : "none";
    }
    if (monthlyrow3) {
      monthlyrow3.style.display = isOn ? "" : "none";
    }
    if (monthlyrow4) {
      monthlyrow4.style.display = isOn ? "" : "none";
    }
    var yearly1_toggle = data.config.yearlyresulttoggle;
    var yearlyrow1 = document.getElementById("yearlyrow1");
    var yearlyrow2 = document.getElementById("yearlyrow2");
    var yearlyrow3 = document.getElementById("yearlyrow3");
    var yearlyrow4 = document.getElementById("yearlyrow4");
    var isOn = yearly1_toggle === true || yearly1_toggle === "on" || yearly1_toggle === "true";
    if (yearlyrow1) {
      yearlyrow1.style.display = isOn ? "" : "none";
    }
    if (yearlyrow2) {
      yearlyrow2.style.display = isOn ? "" : "none";
    }
    if (yearlyrow3) {
      yearlyrow3.style.display = isOn ? "" : "none";
    }
    if (yearlyrow4) {
      yearlyrow4.style.display = isOn ? "" : "none";
    }
    if (locations == "aus") {
      var aussuperval = data.config.superval;
      $("#annuationval").val(aussuperval);
      $("#annuationval1").val(aussuperval);
      $("#annuationvalmobile").val(aussuperval);
      $("#annuationval1mobile").val(aussuperval);
      var ausmodernval = data.config.modernsuperval;
      $("#modernsuperannuation").val(ausmodernval);
      $("#modernsuperannuationmobile").val(ausmodernval);
      if (Layouts == "layout1") {
        if (data.device == "mobile") {
          $(element).find(".notecls").html('<div class="clsdesc">' + data.config.notetxt + "</div>");
          $(element).find("#desktopid").hide();
          $(element).find("#mobileid").show();
          $(".accordion-header").click(function() {
            debugger;
            const content = $(this).next(".accordion-content");
            console.log(content[0]);
            $(".accordion-header img").removeClass("imagerotated");
            $(this).find("img").toggleClass("imagerotated");
            $(".accordion-content").not(content).slideUp();
            content.slideToggle();
            if (content[0].firstElementChild.className == "secondtablayoutMobile") {
              debugger;
              $(element).find(".firsttabcalculation").hide();
              $(element).find(".secondtabcalculation").show();
              $("#currentannualmobile,#secondhourlymobile,#hourlyplusmobile,#hourlyid1mobile,#hourlyRate12mobile,#lesspayval1mobile,#lassannuationval1mobile,#totalcost1mobile").val("0");
              $("#hourlyResult1mobile,#hourlySuper1mobile,hourlyTotal1mobile").html("0");
              $("#dailyResult1mobile,#dailySuper1mobile,#dailyTotal1mobile").html("0");
              $("#fortnightlyResult1mobile,#fortnightlySuper1mobile,#fortnightlyTotal1mobile").html("0");
              $("#monthlyResult1mobile,#monthlySuper1mobile,#monthlyTotal1mobile,#yearlyResult1mobile,#yearlySuper1mobile,#yearlyTotal1mobile").html("0");
              $("#yearlyResult1mobile,#yearlySuper1mobile,#yearlyTotal1mobile").html("0");
            } else {
              debugger;
              $(element).find(".firsttabcalculation").show();
              $(element).find(".secondtabcalculation").hide();
              $("#hourlyRatemobile").val("");
              $("#hourlyidmobile,#hourlyRate1mobile,#lesspayvalmobile,#lassannuationvalmobile,#totalcostmobile").val("0");
              $("#hourlyResultmobile,#hourlySupermobile,#hourlyTotalmobile").html("0");
              $("#dailyResultmobile,#dailySupermobile,#dailyTotalmobile").html("0");
              $("#fortnightlyResultmobile,#fortnightlySupermobile,#fortnightlyTotalmobile").html("0");
              $("#monthlyResultmobile,#monthlySupermobile,#monthlyTotalmobile").html("0");
              $("#yearlyResultmobile,#yearlySupermobile,#yearlyTotalmobile").html("0");
            }
          });
          $(document).ready(function() {
            var previousValue2 = "";
            $("#hourlyRatemobile,#payrollvalmobile,#annuationvalmobile,#currentannualmobile,#addloadmobile,#hourlyRate1mobile,#hourlyRate12mobile,#payrollval1mobile,#annuationval1mobile").on("keyup", function(e) {
              var key = e.key;
              if (!/^[0-9.]$/.test(key) && key.length === 1) {
                e.preventDefault();
                $(this).val(previousValue2);
              }
            });
            $("#hourlyRatemobile,#payrollvalmobile,#annuationvalmobile,#currentannualmobile,#addloadmobile,#hourlyRate1mobile,#hourlyRate12mobile,#payrollval1mobile,#annuationval1mobile").on("input", function() {
              var value = $(this).val();
              if (/^(\d+(\.\d*)?|\.\d*)?$/.test(value)) {
                previousValue2 = value;
              } else {
                $(this).val(previousValue2);
              }
            });
          });
          $(document).ready(function() {
            $(".moreless-button").click(function() {
              let text = $(this).text().trim();
              let newText = text === "+ View Details" ? "- Less Details" : "+ View Details";
              $(".resulttable").toggle();
              $(this).text(newText);
            });
            $("#hourlyRatemobile,#payrollvalmobile,#annuationvalmobile").keyup(function() {
              debugger;
              var hourlyRate = parseFloat(document.getElementById("hourlyRatemobile").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollvalmobile").value);
              var superamt = parseFloat(document.getElementById("annuationvalmobile").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationvalmobile").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyidmobile").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1mobile").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1mobile").value = "";
              }
              document.getElementById("lesspayvalmobile").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationvalmobile").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayvalmobile").value;
              var superannval = document.getElementById("lassannuationvalmobile").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcostmobile").value = TotalCost;
              var taxableDailyRate = BaseHourRate * ausdailyhrs;
              var taxableFortnightlyRate = BaseHourRate * ausfornightyhrs;
              var taxableMonthlyRate = BaseHourRate * ausmonthlyhrs;
              var taxableYearlyRate = BaseHourRate * ausyearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResultmobile").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResultmobile").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResultmobile").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResultmobile").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResultmobile").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResultmobile").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResultmobile").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResultmobile").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResultmobile").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResultmobile").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySupermobile").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySupermobile").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySupermobile").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySupermobile").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySupermobile").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySupermobile").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySupermobile").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySupermobile").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySupermobile").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySupermobile").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotalmobile").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotalmobile").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotalmobile").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotalmobile").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotalmobile").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotalmobile").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotalmobile").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotalmobile").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotalmobile").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotalmobile").innerText = 0;
              }
            });
            $(".clscalculate").click(function() {
              var hourlyRate = parseFloat(document.getElementById("hourlyRatemobile").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollvalmobile").value);
              var superamt = parseFloat(document.getElementById("annuationvalmobile").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationvalmobile").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyidmobile").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1mobile").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1mobile").value = "";
              }
              document.getElementById("lesspayvalmobile").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationvalmobile").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayvalmobile").value;
              var superannval = document.getElementById("lassannuationvalmobile").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcostmobile").value = TotalCost;
              var taxableDailyRate = BaseHourRate * ausdailyhrs;
              var taxableFortnightlyRate = BaseHourRate * ausfornightyhrs;
              var taxableMonthlyRate = BaseHourRate * ausmonthlyhrs;
              var taxableYearlyRate = BaseHourRate * ausyearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResultmobile").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResultmobile").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResultmobile").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResultmobile").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResultmobile").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResultmobile").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResultmobile").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResultmobile").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResultmobile").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResultmobile").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySupermobile").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySupermobile").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySupermobile").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySupermobile").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySupermobile").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySupermobile").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySupermobile").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySupermobile").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySupermobile").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySupermobile").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotalmobile").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotalmobile").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotalmobile").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotalmobile").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotalmobile").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotalmobile").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotalmobile").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotalmobile").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotalmobile").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotalmobile").innerText = 0;
              }
            });
            $("#currentannualmobile,#addloadmobile,#payrollval1mobile,#annuationval1mobile").keyup(function() {
              var curannaualval = parseFloat(document.getElementById("currentannualmobile").value);
              var superPercentage = parseFloat(document.getElementById("annuationval1mobile").value) / 100;
              var WorkingHoursPerWeek = data.config.secondtabtaxhourrate1;
              var WorkingWeeksPerYear = data.config.secondtabtaxhourrate2;
              var annualPercentage = curannaualval / (1 + superPercentage) / (WorkingHoursPerWeek * WorkingWeeksPerYear);
              document.getElementById("secondhourlymobile").value = annualPercentage.toFixed(2);
              var addloadval = parseFloat(document.getElementById("addloadmobile").value);
              var addvalper = addloadval / 100;
              var totaddval = parseFloat(annualPercentage) * parseFloat(addvalper);
              var totadd = parseFloat(totaddval) + parseFloat(annualPercentage);
              var tablehourlyrateval = totadd;
              totadd = totadd.toFixed(2);
              document.getElementById("hourlyplusmobile").value = totadd;
              var firstval = data.config.secondtabtaxhourrate1;
              var secondtaxableHourlyRate = parseFloat(curannaualval) / parseFloat(firstval);
              var secondval = data.config.secondtabtaxhourrate2;
              secondtaxableHourlyRate = parseFloat(secondtaxableHourlyRate) / parseFloat(secondval);
              secondtaxableHourlyRate = secondtaxableHourlyRate.toFixed(2);
              var hourlyRate = parseFloat(document.getElementById("secondhourlymobile").value);
              document.getElementById("hourlyRate12mobile").value = totadd;
              var secval = document.getElementById("hourlyRate12mobile").value;
              var payrollFees = parseFloat(document.getElementById("payrollval1mobile").value);
              var superamt = parseFloat(document.getElementById("annuationval1mobile").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var payrollFeeAmount = parseFloat(totadd) * parseFloat(payrollFeeAmount1);
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = parseFloat(totadd) * parseFloat(superPercentage);
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = parseFloat(hourlyRate) - parseFloat(payrollFeeAmount) - parseFloat(superAmount);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("lesspayval1mobile").value = payrollFeeAmount;
              var lessannval = parseFloat(superPercentage) * parseFloat(totadd);
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval1mobile").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval1mobile").value || 0;
              var superannval = document.getElementById("lassannuationval1mobile").value || 0;
              var h2 = parseFloat(secval) - parseFloat(payrollFees) - parseFloat(lessannval);
              h2 = h2.toFixed(2);
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost1mobile").value = TotalCost;
              debugger;
              var taxhour = totadd * (1 - payrollFeeAmount1);
              taxhour = taxhour.toFixed(2);
              document.getElementById("hourlyid1mobile").value = taxhour;
              hourlyRate = tablehourlyrateval;
              var taxableDailyRate = hourlyRate * ausdailyhrs;
              var taxableFortnightlyRate = hourlyRate * ausfornightyhrs;
              var taxableMonthlyRate = hourlyRate * ausmonthlyhrs;
              var taxableYearlyRate = hourlyRate * ausyearlyhrs;
              var superAmount = hourlyRate * superPercentage;
              var superDailyAmount = taxableDailyRate * superPercentage;
              var superFortnightlyAmount = taxableFortnightlyRate * superPercentage;
              var superMonthlyAmount = taxableMonthlyRate * superPercentage;
              var superYearlyAmount = taxableYearlyRate * superPercentage;
              var HourlyTotalPack = hourlyRate + superAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyResult1mobile").innerText = hourlyRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult1mobile").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult1mobile").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult1mobile").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult1mobile").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult1mobile").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult1mobile").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult1mobile").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult1mobile").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult1mobile").innerText = 0;
              }
              if (superAmount != null && superAmount != void 0 && superAmount != "" && !isNaN(superAmount)) {
                document.getElementById("hourlySuper1mobile").innerText = superAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper1mobile").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper1mobile").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper1mobile").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper1mobile").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper1mobile").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper1mobile").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper1mobile").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper1mobile").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper1mobile").innerText = 0;
              }
              if (HourlyTotalPack != null && HourlyTotalPack != void 0 && HourlyTotalPack != "" && !isNaN(HourlyTotalPack)) {
                document.getElementById("hourlyTotal1mobile").innerText = HourlyTotalPack.toFixed(2);
              } else {
                document.getElementById("hourlyTotal1mobile").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal1mobile").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal1mobile").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal1mobile").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal1mobile").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal1mobile").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal1mobile").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal1mobile").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal1mobile").innerText = 0;
              }
            });
          });
        } else {
          $(element).find(".notecls").html('<div class="clsdesc">' + data.config.notetxt + "</div>");
          $(element).find("#desktopid").show();
          $(element).find("#mobileid").hide();
          $(".tabtext1").click(function() {
            $(".firsttablayout, .firsttabcalculation").show();
            $(".secondtablayout, .secondtabcalculation").hide();
          });
          $(".tabtext2").click(function() {
            $(".firsttablayout, .firsttabcalculation").hide();
            $(".secondtablayout, .secondtabcalculation").show();
          });
          $(document).ready(function() {
            var previousValue2 = "";
            $("#hourlyRate,#payrollval,#annuationval,#currentannual,#addload,#hourlyRate1,#hourlyRate12,#payrollval1,#annuationval1").on("keyup", function(e) {
              var key = e.key;
              if (!/^[0-9.]$/.test(key) && key.length === 1) {
                e.preventDefault();
                $(this).val(previousValue2);
              }
            });
            $("#hourlyRate,#payrollval,#annuationval,#currentannual,#addload,#hourlyRate1,#hourlyRate12,#payrollval1,#annuationval1").on("input", function() {
              var value = $(this).val();
              if (/^(\d+(\.\d*)?|\.\d*)?$/.test(value)) {
                previousValue2 = value;
              } else {
                $(this).val(previousValue2);
              }
            });
          });
          $(document).ready(function() {
            $(".moreless-button").click(function() {
              let text = $(this).text().trim();
              let newText = text === "+ View Details" ? "- Less Details" : "+ View Details";
              $(".resulttable").toggle();
              $(this).text(newText);
            });
            $("#hourlyRate,#payrollval,#annuationval").keyup(function() {
              debugger;
              var hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollval").value);
              var superamt = parseFloat(document.getElementById("annuationval").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationval").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyid").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1").value = "";
              }
              document.getElementById("lesspayval").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval").value;
              var superannval = document.getElementById("lassannuationval").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost").value = TotalCost;
              var taxableDailyRate = BaseHourRate * ausdailyhrs;
              var taxableFortnightlyRate = BaseHourRate * ausfornightyhrs;
              var taxableMonthlyRate = BaseHourRate * ausmonthlyhrs;
              var taxableYearlyRate = BaseHourRate * ausyearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResult").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySuper").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotal").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotal").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal").innerText = 0;
              }
            });
            $(".clscalculate").click(function() {
              var hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollval").value);
              var superamt = parseFloat(document.getElementById("annuationval").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationval").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyid").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1").value = "";
              }
              document.getElementById("lesspayval").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval").value;
              var superannval = document.getElementById("lassannuationval").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost").value = TotalCost;
              var taxableDailyRate = BaseHourRate * ausdailyhrs;
              var taxableFortnightlyRate = BaseHourRate * ausfornightyhrs;
              var taxableMonthlyRate = BaseHourRate * ausmonthlyhrs;
              var taxableYearlyRate = BaseHourRate * ausyearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResult").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySuper").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotal").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotal").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal").innerText = 0;
              }
            });
            $("#currentannual,#addload,#payrollval1,#annuationval1").keyup(function() {
              var curannaualval = parseFloat(document.getElementById("currentannual").value);
              var superPercentage = parseFloat(document.getElementById("annuationval1").value) / 100;
              var WorkingHoursPerWeek = data.config.secondtabtaxhourrate1;
              var WorkingWeeksPerYear = data.config.secondtabtaxhourrate2;
              var annualPercentage = curannaualval / (1 + superPercentage) / (WorkingHoursPerWeek * WorkingWeeksPerYear);
              document.getElementById("secondhourly").value = annualPercentage.toFixed(2);
              var addloadval = parseFloat(document.getElementById("addload").value);
              var addvalper = addloadval / 100;
              var totaddval = parseFloat(annualPercentage) * parseFloat(addvalper);
              var totadd = parseFloat(totaddval) + parseFloat(annualPercentage);
              var tablehourlyrateval = totadd;
              totadd = totadd.toFixed(2);
              document.getElementById("hourlyplus").value = totadd;
              var firstval = data.config.secondtabtaxhourrate1;
              var secondtaxableHourlyRate = parseFloat(curannaualval) / parseFloat(firstval);
              var secondval = data.config.secondtabtaxhourrate2;
              secondtaxableHourlyRate = parseFloat(secondtaxableHourlyRate) / parseFloat(secondval);
              secondtaxableHourlyRate = secondtaxableHourlyRate.toFixed(2);
              var hourlyRate = parseFloat(document.getElementById("secondhourly").value);
              document.getElementById("hourlyRate12").value = totadd;
              var secval = document.getElementById("hourlyRate12").value;
              var payrollFees = parseFloat(document.getElementById("payrollval1").value);
              var superamt = parseFloat(document.getElementById("annuationval1").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var payrollFeeAmount = parseFloat(totadd) * parseFloat(payrollFeeAmount1);
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = parseFloat(totadd) * parseFloat(superPercentage);
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = parseFloat(hourlyRate) - parseFloat(payrollFeeAmount) - parseFloat(superAmount);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("lesspayval1").value = payrollFeeAmount;
              var lessannval = parseFloat(superPercentage) * parseFloat(totadd);
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval1").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval1").value || 0;
              var superannval = document.getElementById("lassannuationval1").value || 0;
              var h2 = parseFloat(secval) - parseFloat(payrollFees) - parseFloat(lessannval);
              h2 = h2.toFixed(2);
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost1").value = TotalCost;
              debugger;
              var taxhour = totadd * (1 - payrollFeeAmount1);
              taxhour = taxhour.toFixed(2);
              document.getElementById("hourlyid1").value = taxhour;
              hourlyRate = tablehourlyrateval;
              var taxableDailyRate = hourlyRate * ausdailyhrs;
              var taxableFortnightlyRate = hourlyRate * ausfornightyhrs;
              var taxableMonthlyRate = hourlyRate * ausmonthlyhrs;
              var taxableYearlyRate = hourlyRate * ausyearlyhrs;
              var superAmount = hourlyRate * superPercentage;
              var superDailyAmount = taxableDailyRate * superPercentage;
              var superFortnightlyAmount = taxableFortnightlyRate * superPercentage;
              var superMonthlyAmount = taxableMonthlyRate * superPercentage;
              var superYearlyAmount = taxableYearlyRate * superPercentage;
              var HourlyTotalPack = hourlyRate + superAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyResult1").innerText = hourlyRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult1").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult1").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult1").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult1").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult1").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult1").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult1").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult1").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult1").innerText = 0;
              }
              if (superAmount != null && superAmount != void 0 && superAmount != "" && !isNaN(superAmount)) {
                document.getElementById("hourlySuper1").innerText = superAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper1").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper1").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper1").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper1").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper1").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper1").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper1").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper1").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper1").innerText = 0;
              }
              if (HourlyTotalPack != null && HourlyTotalPack != void 0 && HourlyTotalPack != "" && !isNaN(HourlyTotalPack)) {
                document.getElementById("hourlyTotal1").innerText = HourlyTotalPack.toFixed(2);
              } else {
                document.getElementById("hourlyTotal1").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal1").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal1").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal1").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal1").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal1").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal1").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal1").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal1").innerText = 0;
              }
            });
          });
        }
      } else {
        if (data.device != "mobile") {
          let calculateSalary2 = function() {
            debugger;
            var inputRate = parseFloat(document.getElementById("yourpay").value) || 0;
            var timePeriod = document.getElementById("time-period").value;
            var superamt = parseFloat(document.getElementById("modernsuperannuation").value);
            var hourlyRate = 0;
            switch (timePeriod) {
              case "hourly":
                hourlyRate = inputRate;
                break;
              case "daily":
                hourlyRate = inputRate / ausdailyhrs;
                break;
              case "fortnightly":
                hourlyRate = inputRate / ausfornightyhrs;
                break;
              case "monthly":
                hourlyRate = inputRate / ausmonthlyhrs;
                break;
              case "yearly":
                hourlyRate = inputRate / ausyearlyhrs;
                break;
            }
            console.log("Input Rate:", inputRate, "Time Period:", timePeriod, "Hourly Rate:", hourlyRate);
            var payrollFees = 0;
            var payrollFeeAmount1 = 0;
            if (payrollFees != "0") {
              payrollFeeAmount1 = payrollFees / 100;
            } else {
              payrollFeeAmount1 = 0;
            }
            var SuperPercentage1 = 0;
            if (superamt != "0") {
              SuperPercentage1 = superamt / 100;
            } else {
              SuperPercentage1 = 0;
            }
            var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
            var superPercentage = parseFloat(document.getElementById("modernsuperannuation").value) / 100;
            var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
            payrollFeeAmount = payrollFeeAmount.toFixed(2);
            var superAmount = hourlyRate * superPercentage;
            superAmount = superAmount.toFixed(2);
            var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
            taxableHourlyRate = taxableHourlyRate.toFixed(2);
            var taxableDailyRate = BaseHourRate * ausdailyhrs;
            var taxableFortnightlyRate = BaseHourRate * ausfornightyhrs;
            var taxableMonthlyRate = BaseHourRate * ausmonthlyhrs;
            var taxableYearlyRate = BaseHourRate * ausyearlyhrs;
            var superHourlyAmount = BaseHourRate * SuperPercentage1;
            var superDailyAmount = taxableDailyRate * SuperPercentage1;
            var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
            var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
            var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
            var totalHourly = BaseHourRate + superHourlyAmount;
            var totalDaily = taxableDailyRate + superDailyAmount;
            var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
            var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
            var totalYearly = taxableYearlyRate + superYearlyAmount;
            if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
              document.getElementById("hourlyResult").innerText = BaseHourRate.toFixed(2);
            } else {
              document.getElementById("hourlyResult").innerText = 0;
            }
            if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
              document.getElementById("dailyResult").innerText = taxableDailyRate.toFixed(2);
            } else {
              document.getElementById("dailyResult").innerText = 0;
            }
            if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
              document.getElementById("fortnightlyResult").innerText = taxableFortnightlyRate.toFixed(2);
            } else {
              document.getElementById("fortnightlyResult").innerText = 0;
            }
            if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
              document.getElementById("monthlyResult").innerText = taxableMonthlyRate.toFixed(2);
            } else {
              document.getElementById("monthlyResult").innerText = 0;
            }
            if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
              document.getElementById("yearlyResult").innerText = taxableYearlyRate.toFixed(2);
            } else {
              document.getElementById("yearlyResult").innerText = 0;
            }
            if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
              document.getElementById("hourlySuper").innerText = superHourlyAmount.toFixed(2);
            } else {
              document.getElementById("hourlySuper").innerText = 0;
            }
            if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
              document.getElementById("dailySuper").innerText = superDailyAmount.toFixed(2);
            } else {
              document.getElementById("dailySuper").innerText = 0;
            }
            if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
              document.getElementById("fortnightlySuper").innerText = superFortnightlyAmount.toFixed(2);
            } else {
              document.getElementById("fortnightlySuper").innerText = 0;
            }
            if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
              document.getElementById("monthlySuper").innerText = superMonthlyAmount.toFixed(2);
            } else {
              document.getElementById("monthlySuper").innerText = 0;
            }
            if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
              document.getElementById("yearlySuper").innerText = superYearlyAmount.toFixed(2);
            } else {
              document.getElementById("yearlySuper").innerText = 0;
            }
            if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
              document.getElementById("hourlyTotal").innerText = totalHourly.toFixed(2);
            } else {
              document.getElementById("hourlyTotal").innerText = 0;
            }
            if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
              document.getElementById("dailyTotal").innerText = totalDaily.toFixed(2);
            } else {
              document.getElementById("dailyTotal").innerText = 0;
            }
            if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
              document.getElementById("fortnightlyTotal").innerText = totalFortnightly.toFixed(2);
            } else {
              document.getElementById("fortnightlyTotal").innerText = 0;
            }
            if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
              document.getElementById("monthlyTotal").innerText = totalMonthly.toFixed(2);
            } else {
              document.getElementById("monthlyTotal").innerText = 0;
            }
            if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
              document.getElementById("yearlyTotal").innerText = totalYearly.toFixed(2);
            } else {
              document.getElementById("yearlyTotal").innerText = 0;
            }
            updateBars2();
          }, updateBars2 = function() {
            var _a, _b, _c;
            debugger;
            const takeHome = parseFloat((_a = document.getElementById("yearlyResult")) == null ? void 0 : _a.textContent) || 0;
            const totalBeforeTax = parseFloat((_b = document.getElementById("yearlyTotal")) == null ? void 0 : _b.textContent) || 0;
            const superAmt = parseFloat((_c = document.getElementById("yearlySuper")) == null ? void 0 : _c.textContent) || 0;
            debugger;
            const taxes = superAmt + takeHome;
            const total1 = takeHome + taxes;
            const takePct = totalBeforeTax ? takeHome / totalBeforeTax * 100 : 0;
            const taxPct = totalBeforeTax ? superAmt / totalBeforeTax * 100 : 0;
            document.querySelector(".take-home").style.width = takePct + "%";
            document.querySelector(".taxes").style.width = taxPct + "%";
            document.getElementById("takeHomeLabel").textContent = `${data.config.basesalary} $${takeHome.toLocaleString()}`;
            document.getElementById("taxesLabel").textContent = `${data.config.supertxt} $${superAmt.toLocaleString()}`;
            document.getElementById("baseSalaryLabel").textContent = `$${totalBeforeTax.toLocaleString()}`;
          };
          var calculateSalary = calculateSalary2, updateBars = updateBars2;
          $(element).find(".notecls").html('<div class="superdesc">' + data.config.notetxt + "</div>");
          $(element).find("#desktopview").show();
          $(element).find("#mobileview").hide();
          var previousValue = "";
          $("#yourpay,#modernsuperannuation").on("keyup", function(e) {
            var key = e.key;
            if (!/^[0-9.]$/.test(key) && key.length === 1) {
              e.preventDefault();
              $(this).val(previousValue);
            }
          });
          $("#time-period").on("change", function() {
            calculateSalary2();
          });
          $("#yourpay, #modernsuperannuation").keyup(function() {
            calculateSalary2();
          });
        } else {
          let calculateSalaryFromLabel2 = function(period) {
            var inputRate = parseFloat(document.getElementById("yourpaymobile").value) || 0;
            var superamt = parseFloat(document.getElementById("modernsuperannuationmobile").value) || 0;
            var hourlyRate = inputRate;
            var SuperPercentage = superamt / 100;
            var BaseHourRate = hourlyRate / (1 + SuperPercentage);
            var base = 0, superAmount = 0, total = 0;
            switch (period) {
              case "hourly":
                base = BaseHourRate;
                break;
              case "daily":
                base = BaseHourRate * ausdailyhrs;
                break;
              case "fortnightly":
                base = BaseHourRate * ausfornightyhrs;
                break;
              case "monthly":
                base = BaseHourRate * ausmonthlyhrs;
                break;
              case "yearly":
                base = BaseHourRate * ausyearlyhrs;
                break;
              default:
                base = 0;
            }
            superAmount = base * SuperPercentage;
            total = base + superAmount;
            document.getElementById("baseSalaryValue").innerText = base.toFixed(3);
            document.getElementById("superValue").innerText = superAmount.toFixed(3);
            document.getElementById("totalPackageValue").innerText = total.toFixed(3);
            updateBars2();
          }, calculateSalary2 = function() {
            debugger;
            var inputRate = parseFloat(document.getElementById("yourpaymobile").value) || 0;
            var timePeriod = document.getElementById("time-periodmobile").value;
            var superamt = parseFloat(document.getElementById("modernsuperannuationmobile").value) || 0;
            var hourlyRate = inputRate;
            console.log("Input Rate:", inputRate, "Time Period:", timePeriod, "Hourly Rate:", hourlyRate);
            var SuperPercentage1 = superamt / 100;
            var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
            var MobileBaseRate = 0;
            var MobileSuperAmount = 0;
            var MobileTotal = 0;
            if (timePeriod === "hourly") {
              debugger;
              MobileBaseRate = BaseHourRate;
              MobileSuperAmount = BaseHourRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "daily") {
              debugger;
              MobileBaseRate = BaseHourRate * ausdailyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "fortnightly") {
              debugger;
              MobileBaseRate = BaseHourRate * ausfornightyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "monthly") {
              debugger;
              MobileBaseRate = BaseHourRate * ausmonthlyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "yearly") {
              debugger;
              MobileBaseRate = BaseHourRate * ausyearlyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            }
            if (MobileTotal != null && MobileTotal != void 0 && MobileTotal != "" && !isNaN(MobileTotal)) {
              document.getElementById("totalPackageValue").innerText = MobileTotal.toFixed(2);
            } else {
              document.getElementById("totalPackageValue").innerText = 0;
            }
            if (MobileSuperAmount != null && MobileSuperAmount != void 0 && MobileSuperAmount != "" && !isNaN(MobileSuperAmount)) {
              document.getElementById("superValue").innerText = MobileSuperAmount.toFixed(2);
            } else {
              document.getElementById("superValue").innerText = 0;
            }
            if (MobileBaseRate != null && MobileBaseRate != void 0 && MobileBaseRate != "" && !isNaN(MobileBaseRate)) {
              document.getElementById("baseSalaryValue").innerText = MobileBaseRate.toFixed(2);
            } else {
              document.getElementById("baseSalaryValue").innerText = 0;
            }
            updateBars2();
          }, updateBars2 = function() {
            var _a, _b, _c;
            const takeHome = parseFloat((_a = document.getElementById("baseSalaryValue")) == null ? void 0 : _a.textContent) || 0;
            const totalBeforeTax = parseFloat((_b = document.getElementById("totalPackageValue")) == null ? void 0 : _b.textContent) || 0;
            const superAmt = parseFloat((_c = document.getElementById("superValue")) == null ? void 0 : _c.textContent) || 0;
            const taxes = superAmt + takeHome;
            const total1 = takeHome + taxes;
            const takePct = totalBeforeTax ? takeHome / totalBeforeTax * 100 : 0;
            const taxPct = totalBeforeTax ? superAmt / totalBeforeTax * 100 : 0;
            document.querySelector("#take-homemobile").style.width = takePct + "%";
            document.querySelector("#taxes-mobile").style.width = taxPct + "%";
            document.getElementById("takeHomeLabelmobile").textContent = `${data.config.basesalary} $${takeHome.toLocaleString()}`;
            document.getElementById("taxesLabelmobile").textContent = `${data.config.supertxt} $${superAmt.toLocaleString()}`;
            document.getElementById("baseSalaryLabelmobile").textContent = `$${totalBeforeTax.toLocaleString()}`;
          };
          var calculateSalaryFromLabel = calculateSalaryFromLabel2, calculateSalary = calculateSalary2, updateBars = updateBars2;
          $(element).find("#desktopview").hide();
          $(element).find("#mobileview").show();
          var previousValue = "";
          $("#yourpaymobile,#modernsuperannuationmobile").on("keyup", function(e) {
            var key = e.key;
            if (!/^[0-9.]$/.test(key) && key.length === 1) {
              e.preventDefault();
              $(this).val(previousValue);
            }
          });
          $("#time-periodmobile").on("change", function() {
            calculateSalary2();
          });
          $(".timelabel").on("click", function() {
            var selectedPeriod = $(this).data("value");
            calculateSalaryFromLabel2(selectedPeriod);
            $(".timelabel").removeClass("active-label");
            $(this).addClass("active-label");
          });
          $("#yourpaymobile, #modernsuperannuationmobile").keyup(function() {
            calculateSalary2();
          });
        }
      }
    } else if (locations == "uk" || locations == "us") {
      var uksuperval = locations == "us" ? data.config.supervalus : data.config.supervaluk;
      $("#annuationval").val(uksuperval);
      $("#annuationval1").val(uksuperval);
      $("#annuationvalmobile").val(uksuperval);
      $("#annuationval1mobile").val(uksuperval);
      var ukmodernval = locations == "us" ? data.config.modernsupervalus : data.config.modernsupervaluk;
      $("#modernsuperannuation").val(ukmodernval);
      $("#modernsuperannuationmobile").val(ukmodernval);
      if (Layouts == "layout1") {
        if (data.device == "mobile") {
          $(element).find(".notecls").html('<div class="clsdesc">' + data.config.notetxt + "</div>");
          $(element).find("#desktopid").hide();
          $(element).find("#mobileid").show();
          $(".accordion-header").click(function() {
            debugger;
            const content = $(this).next(".accordion-content");
            console.log(content[0]);
            $(".accordion-header img").removeClass("imagerotated");
            $(this).find("img").toggleClass("imagerotated");
            $(".accordion-content").not(content).slideUp();
            content.slideToggle();
            if (content[0].firstElementChild.className == "secondtablayoutMobile") {
              debugger;
              $(element).find(".firsttabcalculation").hide();
              $(element).find(".secondtabcalculation").show();
              $("#currentannualmobile,#secondhourlymobile,#hourlyplusmobile,#hourlyid1mobile,#hourlyRate12mobile,#lesspayval1mobile,#lassannuationval1mobile,#totalcost1mobile").val("0");
              $("#hourlyResult1mobile,#hourlySuper1mobile,hourlyTotal1mobile").html("0");
              $("#dailyResult1mobile,#dailySuper1mobile,#dailyTotal1mobile").html("0");
              $("#fortnightlyResult1mobile,#fortnightlySuper1mobile,#fortnightlyTotal1mobile").html("0");
              $("#monthlyResult1mobile,#monthlySuper1mobile,#monthlyTotal1mobile,#yearlyResult1mobile,#yearlySuper1mobile,#yearlyTotal1mobile").html("0");
              $("#yearlyResult1mobile,#yearlySuper1mobile,#yearlyTotal1mobile").html("0");
            } else {
              debugger;
              $(element).find(".firsttabcalculation").show();
              $(element).find(".secondtabcalculation").hide();
              $("#hourlyRatemobile").val("");
              $("#hourlyidmobile,#hourlyRate1mobile,#lesspayvalmobile,#lassannuationvalmobile,#totalcostmobile").val("0");
              $("#hourlyResultmobile,#hourlySupermobile,#hourlyTotalmobile").html("0");
              $("#dailyResultmobile,#dailySupermobile,#dailyTotalmobile").html("0");
              $("#fortnightlyResultmobile,#fortnightlySupermobile,#fortnightlyTotalmobile").html("0");
              $("#monthlyResultmobile,#monthlySupermobile,#monthlyTotalmobile").html("0");
              $("#yearlyResultmobile,#yearlySupermobile,#yearlyTotalmobile").html("0");
            }
          });
          $(document).ready(function() {
            var previousValue2 = "";
            $("#hourlyRatemobile,#payrollvalmobile,#annuationvalmobile,#currentannualmobile,#addloadmobile,#hourlyRate1mobile,#hourlyRate12mobile,#payrollval1mobile,#annuationval1mobile").on("keyup", function(e) {
              var key = e.key;
              if (!/^[0-9.]$/.test(key) && key.length === 1) {
                e.preventDefault();
                $(this).val(previousValue2);
              }
            });
            $("#hourlyRatemobile,#payrollvalmobile,#annuationvalmobile,#currentannualmobile,#addloadmobile,#hourlyRate1mobile,#hourlyRate12mobile,#payrollval1mobile,#annuationval1mobile").on("input", function() {
              var value = $(this).val();
              if (/^(\d+(\.\d*)?|\.\d*)?$/.test(value)) {
                previousValue2 = value;
              } else {
                $(this).val(previousValue2);
              }
            });
          });
          $(document).ready(function() {
            $(".moreless-button").click(function() {
              let text = $(this).text().trim();
              let newText = text === "+ View Details" ? "- Less Details" : "+ View Details";
              $(".resulttable").toggle();
              $(this).text(newText);
            });
            $("#hourlyRatemobile,#payrollvalmobile,#annuationvalmobile").keyup(function() {
              debugger;
              var hourlyRate = parseFloat(document.getElementById("hourlyRatemobile").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollvalmobile").value);
              var superamt = parseFloat(document.getElementById("annuationvalmobile").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationvalmobile").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyidmobile").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1mobile").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1mobile").value = "";
              }
              document.getElementById("lesspayvalmobile").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationvalmobile").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayvalmobile").value;
              var superannval = document.getElementById("lassannuationvalmobile").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcostmobile").value = TotalCost;
              var taxableDailyRate = BaseHourRate * dailyhrs;
              var taxableFortnightlyRate = BaseHourRate * fornightyhrs;
              var taxableMonthlyRate = BaseHourRate * monthlyhrs;
              var taxableYearlyRate = BaseHourRate * yearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResultmobile").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResultmobile").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResultmobile").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResultmobile").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResultmobile").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResultmobile").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResultmobile").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResultmobile").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResultmobile").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResultmobile").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySupermobile").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySupermobile").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySupermobile").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySupermobile").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySupermobile").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySupermobile").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySupermobile").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySupermobile").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySupermobile").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySupermobile").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotalmobile").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotalmobile").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotalmobile").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotalmobile").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotalmobile").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotalmobile").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotalmobile").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotalmobile").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotalmobile").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotalmobile").innerText = 0;
              }
            });
            $(".clscalculate").click(function() {
              var hourlyRate = parseFloat(document.getElementById("hourlyRatemobile").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollvalmobile").value);
              var superamt = parseFloat(document.getElementById("annuationvalmobile").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationvalmobile").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyidmobile").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1mobile").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1mobile").value = "";
              }
              document.getElementById("lesspayvalmobile").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationvalmobile").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayvalmobile").value;
              var superannval = document.getElementById("lassannuationvalmobile").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcostmobile").value = TotalCost;
              var taxableDailyRate = BaseHourRate * dailyhrs;
              var taxableFortnightlyRate = BaseHourRate * fornightyhrs;
              var taxableMonthlyRate = BaseHourRate * monthlyhrs;
              var taxableYearlyRate = BaseHourRate * yearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResultmobile").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResultmobile").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResultmobile").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResultmobile").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResultmobile").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResultmobile").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResultmobile").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResultmobile").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResultmobile").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResultmobile").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySupermobile").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySupermobile").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySupermobile").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySupermobile").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySupermobile").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySupermobile").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySupermobile").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySupermobile").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySupermobile").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySupermobile").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotalmobile").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotalmobile").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotalmobile").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotalmobile").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotalmobile").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotalmobile").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotalmobile").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotalmobile").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotalmobile").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotalmobile").innerText = 0;
              }
            });
            $("#currentannualmobile,#addloadmobile,#payrollval1mobile,#annuationval1mobile").keyup(function() {
              var curannaualval = parseFloat(document.getElementById("currentannualmobile").value);
              var superPercentage = parseFloat(document.getElementById("annuationval1mobile").value) / 100;
              var WorkingHoursPerWeek = data.config.secondtabtaxhourrate1;
              var WorkingWeeksPerYear = data.config.secondtabtaxhourrate2;
              var annualPercentage = curannaualval / (1 + superPercentage) / (WorkingHoursPerWeek * WorkingWeeksPerYear);
              document.getElementById("secondhourlymobile").value = annualPercentage.toFixed(2);
              var addloadval = parseFloat(document.getElementById("addloadmobile").value);
              var addvalper = addloadval / 100;
              var totaddval = parseFloat(annualPercentage) * parseFloat(addvalper);
              var totadd = parseFloat(totaddval) + parseFloat(annualPercentage);
              var tablehourlyrateval = totadd;
              totadd = totadd.toFixed(2);
              document.getElementById("hourlyplusmobile").value = totadd;
              var firstval = data.config.secondtabtaxhourrate1;
              var secondtaxableHourlyRate = parseFloat(curannaualval) / parseFloat(firstval);
              var secondval = data.config.secondtabtaxhourrate2;
              secondtaxableHourlyRate = parseFloat(secondtaxableHourlyRate) / parseFloat(secondval);
              secondtaxableHourlyRate = secondtaxableHourlyRate.toFixed(2);
              var hourlyRate = parseFloat(document.getElementById("secondhourlymobile").value);
              document.getElementById("hourlyRate12mobile").value = totadd;
              var secval = document.getElementById("hourlyRate12mobile").value;
              var payrollFees = parseFloat(document.getElementById("payrollval1mobile").value);
              var superamt = parseFloat(document.getElementById("annuationval1mobile").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var payrollFeeAmount = parseFloat(totadd) * parseFloat(payrollFeeAmount1);
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = parseFloat(totadd) * parseFloat(superPercentage);
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = parseFloat(hourlyRate) - parseFloat(payrollFeeAmount) - parseFloat(superAmount);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("lesspayval1mobile").value = payrollFeeAmount;
              var lessannval = parseFloat(superPercentage) * parseFloat(totadd);
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval1mobile").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval1mobile").value || 0;
              var superannval = document.getElementById("lassannuationval1mobile").value || 0;
              var h2 = parseFloat(secval) - parseFloat(payrollFees) - parseFloat(lessannval);
              h2 = h2.toFixed(2);
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost1mobile").value = TotalCost;
              debugger;
              var taxhour = totadd * (1 - payrollFeeAmount1);
              taxhour = taxhour.toFixed(2);
              document.getElementById("hourlyid1mobile").value = taxhour;
              hourlyRate = tablehourlyrateval;
              var taxableDailyRate = hourlyRate * dailyhrs;
              var taxableFortnightlyRate = hourlyRate * fornightyhrs;
              var taxableMonthlyRate = hourlyRate * monthlyhrs;
              var taxableYearlyRate = hourlyRate * yearlyhrs;
              var superAmount = hourlyRate * superPercentage;
              var superDailyAmount = taxableDailyRate * superPercentage;
              var superFortnightlyAmount = taxableFortnightlyRate * superPercentage;
              var superMonthlyAmount = taxableMonthlyRate * superPercentage;
              var superYearlyAmount = taxableYearlyRate * superPercentage;
              var HourlyTotalPack = hourlyRate + superAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyResult1mobile").innerText = hourlyRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult1mobile").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult1mobile").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult1mobile").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult1mobile").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult1mobile").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult1mobile").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult1mobile").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult1mobile").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult1mobile").innerText = 0;
              }
              if (superAmount != null && superAmount != void 0 && superAmount != "" && !isNaN(superAmount)) {
                document.getElementById("hourlySuper1mobile").innerText = superAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper1mobile").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper1mobile").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper1mobile").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper1mobile").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper1mobile").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper1mobile").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper1mobile").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper1mobile").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper1mobile").innerText = 0;
              }
              if (HourlyTotalPack != null && HourlyTotalPack != void 0 && HourlyTotalPack != "" && !isNaN(HourlyTotalPack)) {
                document.getElementById("hourlyTotal1mobile").innerText = HourlyTotalPack.toFixed(2);
              } else {
                document.getElementById("hourlyTotal1mobile").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal1mobile").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal1mobile").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal1mobile").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal1mobile").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal1mobile").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal1mobile").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal1mobile").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal1mobile").innerText = 0;
              }
            });
          });
        } else {
          $(element).find(".notecls").html('<div class="clsdesc">' + data.config.notetxt + "</div>");
          $(element).find("#desktopid").show();
          $(element).find("#mobileid").hide();
          $(".tabtext1").click(function() {
            $(".firsttablayout, .firsttabcalculation").show();
            $(".secondtablayout, .secondtabcalculation").hide();
          });
          $(".tabtext2").click(function() {
            $(".firsttablayout, .firsttabcalculation").hide();
            $(".secondtablayout, .secondtabcalculation").show();
          });
          $(document).ready(function() {
            var previousValue2 = "";
            $("#hourlyRate,#payrollval,#annuationval,#currentannual,#addload,#hourlyRate1,#hourlyRate12,#payrollval1,#annuationval1").on("keyup", function(e) {
              var key = e.key;
              if (!/^[0-9.]$/.test(key) && key.length === 1) {
                e.preventDefault();
                $(this).val(previousValue2);
              }
            });
            $("#hourlyRate,#payrollval,#annuationval,#currentannual,#addload,#hourlyRate1,#hourlyRate12,#payrollval1,#annuationval1").on("input", function() {
              var value = $(this).val();
              if (/^(\d+(\.\d*)?|\.\d*)?$/.test(value)) {
                previousValue2 = value;
              } else {
                $(this).val(previousValue2);
              }
            });
          });
          $(document).ready(function() {
            $(".moreless-button").click(function() {
              let text = $(this).text().trim();
              let newText = text === "+ View Details" ? "- Less Details" : "+ View Details";
              $(".resulttable").toggle();
              $(this).text(newText);
            });
            $("#hourlyRate,#payrollval,#annuationval").keyup(function() {
              debugger;
              var hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollval").value);
              var superamt = parseFloat(document.getElementById("annuationval").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationval").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyid").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1").value = "";
              }
              document.getElementById("lesspayval").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval").value;
              var superannval = document.getElementById("lassannuationval").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost").value = TotalCost;
              var taxableDailyRate = BaseHourRate * dailyhrs;
              var taxableFortnightlyRate = BaseHourRate * fornightyhrs;
              var taxableMonthlyRate = BaseHourRate * monthlyhrs;
              var taxableYearlyRate = BaseHourRate * yearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResult").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySuper").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotal").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotal").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal").innerText = 0;
              }
            });
            $(".clscalculate").click(function() {
              var hourlyRate = parseFloat(document.getElementById("hourlyRate").value) || 0;
              console.log(hourlyRate);
              var payrollFees = parseFloat(document.getElementById("payrollval").value);
              var superamt = parseFloat(document.getElementById("annuationval").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var SuperPercentage1 = 0;
              if (superamt != "0") {
                SuperPercentage1 = superamt / 100;
              } else {
                SuperPercentage1 = 0;
              }
              var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
              var superPercentage = parseFloat(document.getElementById("annuationval").value) / 100;
              var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = hourlyRate * superPercentage;
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("hourlyid").value = taxableHourlyRate;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyRate1").value = hourlyRate;
              } else {
                document.getElementById("hourlyRate1").value = "";
              }
              document.getElementById("lesspayval").value = payrollFeeAmount;
              var lessannval = superPercentage * hourlyRate;
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval").value;
              var superannval = document.getElementById("lassannuationval").value;
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost").value = TotalCost;
              var taxableDailyRate = BaseHourRate * dailyhrs;
              var taxableFortnightlyRate = BaseHourRate * fornightyhrs;
              var taxableMonthlyRate = BaseHourRate * monthlyhrs;
              var taxableYearlyRate = BaseHourRate * yearlyhrs;
              var superHourlyAmount = BaseHourRate * SuperPercentage1;
              var superDailyAmount = taxableDailyRate * SuperPercentage1;
              var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
              var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
              var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
              var totalHourly = BaseHourRate + superHourlyAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
                document.getElementById("hourlyResult").innerText = BaseHourRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult").innerText = 0;
              }
              if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
                document.getElementById("hourlySuper").innerText = superHourlyAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper").innerText = 0;
              }
              if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
                document.getElementById("hourlyTotal").innerText = totalHourly.toFixed(2);
              } else {
                document.getElementById("hourlyTotal").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal").innerText = 0;
              }
            });
            $("#currentannual,#addload,#payrollval1,#annuationval1").keyup(function() {
              var curannaualval = parseFloat(document.getElementById("currentannual").value);
              var superPercentage = parseFloat(document.getElementById("annuationval1").value) / 100;
              var WorkingHoursPerWeek = data.config.secondtabtaxhourrate1;
              var WorkingWeeksPerYear = data.config.secondtabtaxhourrate2;
              var annualPercentage = curannaualval / (1 + superPercentage) / (WorkingHoursPerWeek * WorkingWeeksPerYear);
              document.getElementById("secondhourly").value = annualPercentage.toFixed(2);
              var addloadval = parseFloat(document.getElementById("addload").value);
              var addvalper = addloadval / 100;
              var totaddval = parseFloat(annualPercentage) * parseFloat(addvalper);
              var totadd = parseFloat(totaddval) + parseFloat(annualPercentage);
              var tablehourlyrateval = totadd;
              totadd = totadd.toFixed(2);
              document.getElementById("hourlyplus").value = totadd;
              var firstval = data.config.secondtabtaxhourrate1;
              var secondtaxableHourlyRate = parseFloat(curannaualval) / parseFloat(firstval);
              var secondval = data.config.secondtabtaxhourrate2;
              secondtaxableHourlyRate = parseFloat(secondtaxableHourlyRate) / parseFloat(secondval);
              secondtaxableHourlyRate = secondtaxableHourlyRate.toFixed(2);
              var hourlyRate = parseFloat(document.getElementById("secondhourly").value);
              document.getElementById("hourlyRate12").value = totadd;
              var secval = document.getElementById("hourlyRate12").value;
              var payrollFees = parseFloat(document.getElementById("payrollval1").value);
              var superamt = parseFloat(document.getElementById("annuationval1").value);
              var payrollFeeAmount1 = 0;
              if (payrollFees != "0") {
                payrollFeeAmount1 = payrollFees / 100;
              } else {
                payrollFeeAmount1 = 0;
              }
              var payrollFeeAmount = parseFloat(totadd) * parseFloat(payrollFeeAmount1);
              payrollFeeAmount = payrollFeeAmount.toFixed(2);
              var superAmount = parseFloat(totadd) * parseFloat(superPercentage);
              superAmount = superAmount.toFixed(2);
              var taxableHourlyRate = parseFloat(hourlyRate) - parseFloat(payrollFeeAmount) - parseFloat(superAmount);
              taxableHourlyRate = taxableHourlyRate.toFixed(2);
              document.getElementById("lesspayval1").value = payrollFeeAmount;
              var lessannval = parseFloat(superPercentage) * parseFloat(totadd);
              lessannval = lessannval.toFixed(2);
              document.getElementById("lassannuationval1").value = lessannval;
              var payrollfeesval = document.getElementById("lesspayval1").value || 0;
              var superannval = document.getElementById("lassannuationval1").value || 0;
              var h2 = parseFloat(secval) - parseFloat(payrollFees) - parseFloat(lessannval);
              h2 = h2.toFixed(2);
              var TotalCost = parseFloat(payrollfeesval) + parseFloat(superannval);
              TotalCost = TotalCost.toFixed(2);
              document.getElementById("totalcost1").value = TotalCost;
              debugger;
              var taxhour = totadd * (1 - payrollFeeAmount1);
              taxhour = taxhour.toFixed(2);
              document.getElementById("hourlyid1").value = taxhour;
              hourlyRate = tablehourlyrateval;
              var taxableDailyRate = hourlyRate * dailyhrs;
              var taxableFortnightlyRate = hourlyRate * fornightyhrs;
              var taxableMonthlyRate = hourlyRate * monthlyhrs;
              var taxableYearlyRate = hourlyRate * yearlyhrs;
              var superAmount = hourlyRate * superPercentage;
              var superDailyAmount = taxableDailyRate * superPercentage;
              var superFortnightlyAmount = taxableFortnightlyRate * superPercentage;
              var superMonthlyAmount = taxableMonthlyRate * superPercentage;
              var superYearlyAmount = taxableYearlyRate * superPercentage;
              var HourlyTotalPack = hourlyRate + superAmount;
              var totalDaily = taxableDailyRate + superDailyAmount;
              var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
              var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
              var totalYearly = taxableYearlyRate + superYearlyAmount;
              if (hourlyRate != null && hourlyRate != void 0 && hourlyRate != "" && !isNaN(hourlyRate)) {
                document.getElementById("hourlyResult1").innerText = hourlyRate.toFixed(2);
              } else {
                document.getElementById("hourlyResult1").innerText = 0;
              }
              if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
                document.getElementById("dailyResult1").innerText = taxableDailyRate.toFixed(2);
              } else {
                document.getElementById("dailyResult1").innerText = 0;
              }
              if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
                document.getElementById("fortnightlyResult1").innerText = taxableFortnightlyRate.toFixed(2);
              } else {
                document.getElementById("fortnightlyResult1").innerText = 0;
              }
              if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
                document.getElementById("monthlyResult1").innerText = taxableMonthlyRate.toFixed(2);
              } else {
                document.getElementById("monthlyResult1").innerText = 0;
              }
              if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
                document.getElementById("yearlyResult1").innerText = taxableYearlyRate.toFixed(2);
              } else {
                document.getElementById("yearlyResult1").innerText = 0;
              }
              if (superAmount != null && superAmount != void 0 && superAmount != "" && !isNaN(superAmount)) {
                document.getElementById("hourlySuper1").innerText = superAmount.toFixed(2);
              } else {
                document.getElementById("hourlySuper1").innerText = 0;
              }
              if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
                document.getElementById("dailySuper1").innerText = superDailyAmount.toFixed(2);
              } else {
                document.getElementById("dailySuper1").innerText = 0;
              }
              if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
                document.getElementById("fortnightlySuper1").innerText = superFortnightlyAmount.toFixed(2);
              } else {
                document.getElementById("fortnightlySuper1").innerText = 0;
              }
              if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
                document.getElementById("monthlySuper1").innerText = superMonthlyAmount.toFixed(2);
              } else {
                document.getElementById("monthlySuper1").innerText = 0;
              }
              if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
                document.getElementById("yearlySuper1").innerText = superYearlyAmount.toFixed(2);
              } else {
                document.getElementById("yearlySuper1").innerText = 0;
              }
              if (HourlyTotalPack != null && HourlyTotalPack != void 0 && HourlyTotalPack != "" && !isNaN(HourlyTotalPack)) {
                document.getElementById("hourlyTotal1").innerText = HourlyTotalPack.toFixed(2);
              } else {
                document.getElementById("hourlyTotal1").innerText = 0;
              }
              if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
                document.getElementById("dailyTotal1").innerText = totalDaily.toFixed(2);
              } else {
                document.getElementById("dailyTotal1").innerText = 0;
              }
              if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
                document.getElementById("fortnightlyTotal1").innerText = totalFortnightly.toFixed(2);
              } else {
                document.getElementById("fortnightlyTotal1").innerText = 0;
              }
              if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
                document.getElementById("monthlyTotal1").innerText = totalMonthly.toFixed(2);
              } else {
                document.getElementById("monthlyTotal1").innerText = 0;
              }
              if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
                document.getElementById("yearlyTotal1").innerText = totalYearly.toFixed(2);
              } else {
                document.getElementById("yearlyTotal1").innerText = 0;
              }
            });
          });
        }
      } else {
        if (data.device != "mobile") {
          let calculateSalary2 = function() {
            debugger;
            var inputRate = parseFloat(document.getElementById("yourpay").value) || 0;
            var timePeriod = document.getElementById("time-period").value;
            var superamt = parseFloat(document.getElementById("modernsuperannuation").value);
            var hourlyRate = 0;
            switch (timePeriod) {
              case "hourly":
                hourlyRate = inputRate;
                break;
              case "daily":
                hourlyRate = inputRate / dailyhrs;
                break;
              case "fortnightly":
                hourlyRate = inputRate / fornightyhrs;
                break;
              case "monthly":
                hourlyRate = inputRate / monthlyhrs;
                break;
              case "yearly":
                hourlyRate = inputRate / yearlyhrs;
                break;
            }
            console.log("Input Rate:", inputRate, "Time Period:", timePeriod, "Hourly Rate:", hourlyRate);
            var payrollFees = 0;
            var payrollFeeAmount1 = 0;
            if (payrollFees != "0") {
              payrollFeeAmount1 = payrollFees / 100;
            } else {
              payrollFeeAmount1 = 0;
            }
            var SuperPercentage1 = 0;
            if (superamt != "0") {
              SuperPercentage1 = superamt / 100;
            } else {
              SuperPercentage1 = 0;
            }
            var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
            var superPercentage = parseFloat(document.getElementById("modernsuperannuation").value) / 100;
            var payrollFeeAmount = hourlyRate * payrollFeeAmount1;
            payrollFeeAmount = payrollFeeAmount.toFixed(2);
            var superAmount = hourlyRate * superPercentage;
            superAmount = superAmount.toFixed(2);
            var taxableHourlyRate = BaseHourRate * (1 - payrollFeeAmount1);
            taxableHourlyRate = taxableHourlyRate.toFixed(2);
            var taxableDailyRate = BaseHourRate * dailyhrs;
            var taxableFortnightlyRate = BaseHourRate * fornightyhrs;
            var taxableMonthlyRate = BaseHourRate * monthlyhrs;
            var taxableYearlyRate = BaseHourRate * yearlyhrs;
            var superHourlyAmount = BaseHourRate * SuperPercentage1;
            var superDailyAmount = taxableDailyRate * SuperPercentage1;
            var superFortnightlyAmount = taxableFortnightlyRate * SuperPercentage1;
            var superMonthlyAmount = taxableMonthlyRate * SuperPercentage1;
            var superYearlyAmount = taxableYearlyRate * SuperPercentage1;
            var totalHourly = BaseHourRate + superHourlyAmount;
            var totalDaily = taxableDailyRate + superDailyAmount;
            var totalFortnightly = taxableFortnightlyRate + superFortnightlyAmount;
            var totalMonthly = taxableMonthlyRate + superMonthlyAmount;
            var totalYearly = taxableYearlyRate + superYearlyAmount;
            if (BaseHourRate != null && BaseHourRate != void 0 && BaseHourRate != "" && !isNaN(BaseHourRate)) {
              document.getElementById("hourlyResult").innerText = BaseHourRate.toFixed(2);
            } else {
              document.getElementById("hourlyResult").innerText = 0;
            }
            if (taxableDailyRate != null && taxableDailyRate != void 0 && taxableDailyRate != "" && !isNaN(taxableDailyRate)) {
              document.getElementById("dailyResult").innerText = taxableDailyRate.toFixed(2);
            } else {
              document.getElementById("dailyResult").innerText = 0;
            }
            if (taxableFortnightlyRate != null && taxableFortnightlyRate != void 0 && taxableFortnightlyRate != "" && !isNaN(taxableFortnightlyRate)) {
              document.getElementById("fortnightlyResult").innerText = taxableFortnightlyRate.toFixed(2);
            } else {
              document.getElementById("fortnightlyResult").innerText = 0;
            }
            if (taxableMonthlyRate != null && taxableMonthlyRate != void 0 && taxableMonthlyRate != "" && !isNaN(taxableMonthlyRate)) {
              document.getElementById("monthlyResult").innerText = taxableMonthlyRate.toFixed(2);
            } else {
              document.getElementById("monthlyResult").innerText = 0;
            }
            if (taxableYearlyRate != null && taxableYearlyRate != void 0 && taxableYearlyRate != "" && !isNaN(taxableYearlyRate)) {
              document.getElementById("yearlyResult").innerText = taxableYearlyRate.toFixed(2);
            } else {
              document.getElementById("yearlyResult").innerText = 0;
            }
            if (superHourlyAmount != null && superHourlyAmount != void 0 && superHourlyAmount != "" && !isNaN(superHourlyAmount)) {
              document.getElementById("hourlySuper").innerText = superHourlyAmount.toFixed(2);
            } else {
              document.getElementById("hourlySuper").innerText = 0;
            }
            if (superDailyAmount != null && superDailyAmount != void 0 && superDailyAmount != "" && !isNaN(superDailyAmount)) {
              document.getElementById("dailySuper").innerText = superDailyAmount.toFixed(2);
            } else {
              document.getElementById("dailySuper").innerText = 0;
            }
            if (superFortnightlyAmount != null && superFortnightlyAmount != void 0 && superFortnightlyAmount != "" && !isNaN(superFortnightlyAmount)) {
              document.getElementById("fortnightlySuper").innerText = superFortnightlyAmount.toFixed(2);
            } else {
              document.getElementById("fortnightlySuper").innerText = 0;
            }
            if (superMonthlyAmount != null && superMonthlyAmount != void 0 && superMonthlyAmount != "" && !isNaN(superMonthlyAmount)) {
              document.getElementById("monthlySuper").innerText = superMonthlyAmount.toFixed(2);
            } else {
              document.getElementById("monthlySuper").innerText = 0;
            }
            if (superYearlyAmount != null && superYearlyAmount != void 0 && superYearlyAmount != "" && !isNaN(superYearlyAmount)) {
              document.getElementById("yearlySuper").innerText = superYearlyAmount.toFixed(2);
            } else {
              document.getElementById("yearlySuper").innerText = 0;
            }
            if (totalHourly != null && totalHourly != void 0 && totalHourly != "" && !isNaN(totalHourly)) {
              document.getElementById("hourlyTotal").innerText = totalHourly.toFixed(2);
            } else {
              document.getElementById("hourlyTotal").innerText = 0;
            }
            if (totalDaily != null && totalDaily != void 0 && totalDaily != "" && !isNaN(totalDaily)) {
              document.getElementById("dailyTotal").innerText = totalDaily.toFixed(2);
            } else {
              document.getElementById("dailyTotal").innerText = 0;
            }
            if (totalFortnightly != null && totalFortnightly != void 0 && totalFortnightly != "" && !isNaN(totalFortnightly)) {
              document.getElementById("fortnightlyTotal").innerText = totalFortnightly.toFixed(2);
            } else {
              document.getElementById("fortnightlyTotal").innerText = 0;
            }
            if (totalMonthly != null && totalMonthly != void 0 && totalMonthly != "" && !isNaN(totalMonthly)) {
              document.getElementById("monthlyTotal").innerText = totalMonthly.toFixed(2);
            } else {
              document.getElementById("monthlyTotal").innerText = 0;
            }
            if (totalYearly != null && totalYearly != void 0 && totalYearly != "" && !isNaN(totalYearly)) {
              document.getElementById("yearlyTotal").innerText = totalYearly.toFixed(2);
            } else {
              document.getElementById("yearlyTotal").innerText = 0;
            }
            updateBars2();
          }, updateBars2 = function() {
            var _a, _b, _c;
            debugger;
            const takeHome = parseFloat((_a = document.getElementById("yearlyResult")) == null ? void 0 : _a.textContent) || 0;
            const totalBeforeTax = parseFloat((_b = document.getElementById("yearlyTotal")) == null ? void 0 : _b.textContent) || 0;
            const superAmt = parseFloat((_c = document.getElementById("yearlySuper")) == null ? void 0 : _c.textContent) || 0;
            debugger;
            const taxes = superAmt + takeHome;
            const total1 = takeHome + taxes;
            const takePct = totalBeforeTax ? takeHome / totalBeforeTax * 100 : 0;
            const taxPct = totalBeforeTax ? superAmt / totalBeforeTax * 100 : 0;
            document.querySelector(".take-home").style.width = takePct + "%";
            document.querySelector(".taxes").style.width = taxPct + "%";
            document.getElementById("takeHomeLabel").textContent = `${data.config.basesalary} $${takeHome.toLocaleString()}`;
            document.getElementById("taxesLabel").textContent = `${data.config.supertxt} $${superAmt.toLocaleString()}`;
            document.getElementById("baseSalaryLabel").textContent = `$${totalBeforeTax.toLocaleString()}`;
          };
          var calculateSalary = calculateSalary2, updateBars = updateBars2;
          $(element).find(".notecls").html('<div class="superdesc">' + data.config.notetxt + "</div>");
          $(element).find("#desktopview").show();
          $(element).find("#mobileview").hide();
          var previousValue = "";
          $("#yourpay,#modernsuperannuation").on("keyup", function(e) {
            var key = e.key;
            if (!/^[0-9.]$/.test(key) && key.length === 1) {
              e.preventDefault();
              $(this).val(previousValue);
            }
          });
          $("#time-period").on("change", function() {
            calculateSalary2();
          });
          $("#yourpay, #modernsuperannuation").keyup(function() {
            calculateSalary2();
          });
        } else {
          let calculateSalaryFromLabel2 = function(period) {
            var inputRate = parseFloat(document.getElementById("yourpaymobile").value) || 0;
            var superamt = parseFloat(document.getElementById("modernsuperannuationmobile").value) || 0;
            var hourlyRate = inputRate;
            var SuperPercentage = superamt / 100;
            var BaseHourRate = hourlyRate / (1 + SuperPercentage);
            var base = 0, superAmount = 0, total = 0;
            switch (period) {
              case "hourly":
                base = BaseHourRate;
                break;
              case "daily":
                base = BaseHourRate * dailyhrs;
                break;
              case "fortnightly":
                base = BaseHourRate * fornightyhrs;
                break;
              case "monthly":
                base = BaseHourRate * monthlyhrs;
                break;
              case "yearly":
                base = BaseHourRate * yearlyhrs;
                break;
              default:
                base = 0;
            }
            superAmount = base * SuperPercentage;
            total = base + superAmount;
            document.getElementById("baseSalaryValue").innerText = base.toFixed(3);
            document.getElementById("superValue").innerText = superAmount.toFixed(3);
            document.getElementById("totalPackageValue").innerText = total.toFixed(3);
            updateBars2();
          }, calculateSalary2 = function() {
            debugger;
            var inputRate = parseFloat(document.getElementById("yourpaymobile").value) || 0;
            var timePeriod = document.getElementById("time-periodmobile").value;
            var superamt = parseFloat(document.getElementById("modernsuperannuationmobile").value) || 0;
            var hourlyRate = inputRate;
            console.log("Input Rate:", inputRate, "Time Period:", timePeriod, "Hourly Rate:", hourlyRate);
            var SuperPercentage1 = superamt / 100;
            var BaseHourRate = hourlyRate / (1 + SuperPercentage1);
            var MobileBaseRate = 0;
            var MobileSuperAmount = 0;
            var MobileTotal = 0;
            if (timePeriod === "hourly") {
              debugger;
              MobileBaseRate = BaseHourRate;
              MobileSuperAmount = BaseHourRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "daily") {
              debugger;
              MobileBaseRate = BaseHourRate * dailyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "fortnightly") {
              debugger;
              MobileBaseRate = BaseHourRate * fornightyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "monthly") {
              debugger;
              MobileBaseRate = BaseHourRate * monthlyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            } else if (timePeriod === "yearly") {
              debugger;
              MobileBaseRate = BaseHourRate * yearlyhrs;
              MobileSuperAmount = MobileBaseRate * SuperPercentage1;
              MobileTotal = MobileBaseRate + MobileSuperAmount;
            }
            if (MobileTotal != null && MobileTotal != void 0 && MobileTotal != "" && !isNaN(MobileTotal)) {
              document.getElementById("totalPackageValue").innerText = MobileTotal.toFixed(2);
            } else {
              document.getElementById("totalPackageValue").innerText = 0;
            }
            if (MobileSuperAmount != null && MobileSuperAmount != void 0 && MobileSuperAmount != "" && !isNaN(MobileSuperAmount)) {
              document.getElementById("superValue").innerText = MobileSuperAmount.toFixed(2);
            } else {
              document.getElementById("superValue").innerText = 0;
            }
            if (MobileBaseRate != null && MobileBaseRate != void 0 && MobileBaseRate != "" && !isNaN(MobileBaseRate)) {
              document.getElementById("baseSalaryValue").innerText = MobileBaseRate.toFixed(2);
            } else {
              document.getElementById("baseSalaryValue").innerText = 0;
            }
            updateBars2();
          }, updateBars2 = function() {
            var _a, _b, _c;
            const takeHome = parseFloat((_a = document.getElementById("baseSalaryValue")) == null ? void 0 : _a.textContent) || 0;
            const totalBeforeTax = parseFloat((_b = document.getElementById("totalPackageValue")) == null ? void 0 : _b.textContent) || 0;
            const superAmt = parseFloat((_c = document.getElementById("superValue")) == null ? void 0 : _c.textContent) || 0;
            const taxes = superAmt + takeHome;
            const total1 = takeHome + taxes;
            const takePct = totalBeforeTax ? takeHome / totalBeforeTax * 100 : 0;
            const taxPct = totalBeforeTax ? superAmt / totalBeforeTax * 100 : 0;
            document.querySelector("#take-homemobile").style.width = takePct + "%";
            document.querySelector("#taxes-mobile").style.width = taxPct + "%";
            document.getElementById("takeHomeLabelmobile").textContent = `${data.config.basesalary} $${takeHome.toLocaleString()}`;
            document.getElementById("taxesLabelmobile").textContent = `${data.config.supertxt} $${superAmt.toLocaleString()}`;
            document.getElementById("baseSalaryLabelmobile").textContent = `$${totalBeforeTax.toLocaleString()}`;
          };
          var calculateSalaryFromLabel = calculateSalaryFromLabel2, calculateSalary = calculateSalary2, updateBars = updateBars2;
          $(element).find("#desktopview").hide();
          $(element).find("#mobileview").show();
          var previousValue = "";
          $("#yourpaymobile,#modernsuperannuationmobile").on("keyup", function(e) {
            var key = e.key;
            if (!/^[0-9.]$/.test(key) && key.length === 1) {
              e.preventDefault();
              $(this).val(previousValue);
            }
          });
          $("#time-periodmobile").on("change", function() {
            calculateSalary2();
          });
          $(".timelabel").on("click", function() {
            var selectedPeriod = $(this).data("value");
            calculateSalaryFromLabel2(selectedPeriod);
            $(".timelabel").removeClass("active-label");
            $(this).addClass("active-label");
          });
          $("#yourpaymobile, #modernsuperannuationmobile").keyup(function() {
            calculateSalary2();
          });
        }
      }
    }
  }
  return __toCommonJS(salary_calculator_index_exports);
})();
(function(){
  var reg = (typeof window !== 'undefined' && window.__shazWidgetExport) || {};
  var controller = reg.default || reg;
  if (typeof window !== 'undefined') {
    window.ShazammeWidget = window.ShazammeWidget || {};
    window.ShazammeWidget["salary-calculator"] = controller;
    window.__shazWidgetExport = void 0;
  }
})();
