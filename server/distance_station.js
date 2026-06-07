export function computeDistances(graph, start) {
  const distances = {};
  const queue = [start];

  distances[start] = 0;

  while (queue.length > 0) {
    const current = queue.shift();

    for (const neighbor of graph[current]) {
      if (distances[neighbor] === undefined) {
        distances[neighbor] = distances[current] + 1;
        queue.push(neighbor);
      }
    }
  }

  return distances;
}