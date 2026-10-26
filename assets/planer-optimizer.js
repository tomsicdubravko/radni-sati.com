/* G1: pure calendar-day optimizer, shared only by the RS, ME and BA planners. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GOOptimizer = factory();
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  function calendar(options) {
    var year = options.year, holidays = options.holidays || {}, existing = new Set(options.existing || []), days = [];
    // UTC is used only for date enumeration: DST must not change calendar-day counts.
    for (var t = Date.UTC(year, 0, 1); new Date(t).getUTCFullYear() === year; t += 86400000) {
      var date = new Date(t), key = date.toISOString().slice(0, 10), weekday = date.getUTCDay();
      var rest = weekday === 0 || (weekday === 6 && options.week !== 6);
      days.push({ key: key, quarter: Math.floor(date.getUTCMonth() / 3), holiday: !!holidays[key],
        holidayWorkday: !!holidays[key] && !rest, natural: rest || !!holidays[key], manual: existing.has(key) });
    }
    return days;
  }
  function periods(days, selected) {
    var set = new Set(selected), result = [];
    for (var i = 0; i < days.length;) {
      if (!days[i].natural && !set.has(days[i].key)) { i++; continue; }
      var start = i, leave = 0;
      while (i < days.length && (days[i].natural || set.has(days[i].key))) {
        if (set.has(days[i].key)) leave++;
        i++;
      }
      if (leave) result.push({ from: days[start].key, to: days[i - 1].key, free: i - start, leave: leave });
    }
    return result;
  }
  function candidates(days, budget, fallback) {
    var base = days.map(function (d) { return d.natural || d.manual; });
    var covered = new Array(days.length).fill(false);
    // Existing holiday/weekend days already belonging to a manual break earn no new reward.
    for (var i = 0; i < days.length;) {
      if (!base[i]) { i++; continue; }
      var start = i, manual = false;
      while (i < days.length && base[i]) { manual = manual || days[i].manual; i++; }
      if (manual) for (var k = start; k < i; k++) covered[k] = true;
    }
    var naturalPrefix = [0], holidayPrefix = [0];
    days.forEach(function (d, i) {
      naturalPrefix.push(naturalPrefix[i] + (d.natural && !covered[i] ? 1 : 0));
      holidayPrefix.push(holidayPrefix[i] + (d.holidayWorkday && !covered[i] ? 1 : 0));
    });
    var result = [];
    for (var first = 0; first < days.length; first++) {
      if (base[first]) continue;
      var a = first;
      while (a > 0 && base[a - 1]) a--;
      var added = [], mask = 0;
      for (var last = first; last < days.length; last++) {
        if (base[last]) continue;
        added.push(days[last].key);
        mask |= 1 << days[last].quarter;
        if (added.length > budget || (fallback && added.length > 1)) break;
        var b = last;
        while (b + 1 < days.length && base[b + 1]) b++;
        var natural = naturalPrefix[b + 1] - naturalPrefix[a], hasHoliday = holidayPrefix[b + 1] > holidayPrefix[a];
        // Utility = newly connected natural days minus newly spent leave days.
        // Thus weak extensions cannot consume the balance simply to exhaust it.
        var utility = fallback ? natural : natural - added.length;
        if (utility <= 0 || (!fallback && !hasHoliday)) continue;
        // Fallback: at most one short break in each quarter, not 52 unrelated Fridays.
        var midpoint = Math.floor((days.length / 4) * (days[first].quarter + 0.5));
        result.push({ start: a, end: b, added: added.slice(), cost: added.length, utility: utility,
          mask: mask, concentration: fallback ? Math.abs(first - midpoint) : added.length * added.length });
      }
    }
    return result.sort(function (a, b) { return a.start - b.start || a.end - b.end; });
  }
  function bits(mask) { var n = 0; for (; mask; mask &= mask - 1) n++; return n; }
  function better(a, b) {
    if (!b) return true;
    return a.utility > b.utility || (a.utility === b.utility &&
      (a.cost < b.cost || (a.cost === b.cost &&
        (bits(a.mask) > bits(b.mask) || (bits(a.mask) === bits(b.mask) &&
          (a.concentration < b.concentration || (a.concentration === b.concentration && a.order < b.order)))))));
  }
  function optimize(list, budget, dayCount, fallback) {
    // Calendar-position / budget / quarter-mask DP. Transitions select complete,
    // nonoverlapping periods with a working-day gap, or skip one calendar day.
    var buckets = Array.from({ length: dayCount }, function () { return []; });
    list.forEach(function (c) { buckets[c.start].push(c); });
    var states = Array.from({ length: dayCount + 2 }, function () { return new Map(); });
    var empty = { utility: 0, cost: 0, mask: 0, concentration: 0, order: '', previous: null, candidate: null };
    states[0].set(0, empty);
    function put(at, state) {
      var key = state.cost * 16 + state.mask, old = states[at].get(key);
      if (better(state, old)) states[at].set(key, state);
    }
    for (var day = 0; day < dayCount; day++) {
      states[day].forEach(function (state) {
        put(day + 1, state);
        buckets[day].forEach(function (c) {
          if (state.cost + c.cost > budget || (fallback && (state.mask & c.mask))) return;
          put(Math.min(dayCount, c.end + 2), { utility: state.utility + c.utility, cost: state.cost + c.cost,
            mask: state.mask | c.mask, concentration: state.concentration + c.concentration,
            order: state.order + c.added.join(',') + ';', previous: state, candidate: c });
        });
      });
    }
    var best = empty;
    states[dayCount].forEach(function (state) { if (better(state, best)) best = state; });
    var chosen = [], node = best;
    while (node && node.candidate) { chosen.push(node.candidate); node = node.previous; }
    return { chosen: chosen.reverse(), utility: best.utility, cost: best.cost, mask: best.mask, concentration: best.concentration, order: best.order };
  }
  function propose(options) {
    var year = Number(options.year), total = Number(options.total), existing = (options.existing || []).slice();
    if (!Number.isInteger(year) || year < 1900 || year > 2099 || !Number.isInteger(total) || total < 0 || total > 60 ||
        (options.week !== 5 && options.week !== 6)) return { available: false, reason: 'invalid' };
    if (options.supported === false) return { available: false, reason: 'coverage' };
    var days = calendar(options), budget = Math.max(0, total - existing.length);
    var list = candidates(days, budget, false), fallback = !list.length && budget > 0;
    if (fallback) list = candidates(days, budget, true);
    var solution = optimize(list, budget, days.length, fallback);
    var added = solution.chosen.reduce(function (all, c) { return all.concat(c.added); }, []).sort();
    var plan = existing.concat(added).sort(), blocks = periods(days, plan);
    blocks.forEach(function (block) { block.added = added.filter(function (d) { return d >= block.from && d <= block.to; }).length; });
    return { available: true, fallback: fallback, added: added, plan: plan, periods: blocks,
      used: plan.length, remaining: total - plan.length, free: blocks.reduce(function (n, b) { return n + b.free; }, 0),
      utility: solution.utility };
  }
  return { calendar: calendar, periods: periods, candidates: candidates, optimize: optimize, better: better, propose: propose };
});
