import { groupBy, uniq } from 'lodash';
import technologiesJson from './technologies.json';

interface TechnologyNode {
  readonly name: string;
  readonly epoch: string;
  readonly cost?: string;
  readonly extra?: string;
  readonly blockedBy: TechnologyNode[];
  readonly blocking: TechnologyNode[];
  readonly specialPrerequisites?: readonly string[];
  readonly highlighted?: boolean;
}

function extractTechnologyTree(
  searchName: string | string
): readonly TechnologyNode[] {
  // Constructs the whole tree.
  const technologies = new Map<string, TechnologyNode>(
    technologiesJson.map((json) => [
      json.name,
      {
        ...json,
        blockedBy: [],
        blocking: [],
      },
    ])
  );
  for (const technologyJson of technologiesJson) {
    const technology = technologies.get(technologyJson.name);
    if (!technology) {
      console.error('Expected technology for', technologyJson);
      throw new TypeError('1');
    }
    for (const pre of technologyJson.prerequisites ?? []) {
      // Renders any of as all of for convenience.
      for (const prePart of pre.split('/')) {
        const prerequisiteTechnology = technologies.get(prePart);
        if (!prerequisiteTechnology) {
          console.error('Expected prerequisite technology for', {
            technologyJson,
            pre,
          });
          throw new TypeError('1');
        }
        prerequisiteTechnology.blocking.push(technology);
        technology.blockedBy.push(prerequisiteTechnology);
      }
    }
  }

  // Extracts subtree if any.
  const technology = technologies.get(searchName);
  if (!technology) {
    return [...technologies.values()];
  }

  const result = new Set<TechnologyNode>();
  // Finds blockers.
  let queue: TechnologyNode[] = [technology];
  for (const tech of queue) {
    result.add(tech);
    queue.push(...tech.blockedBy);
  }
  // Finds blockees n-levels deep.
  queue = [...technology.blocking];
  for (let times = 0; times < 1; times++) {
    queue.forEach((item) => void result.add(item));
    queue = queue.flatMap((item) => item.blocking);
  }

  return [...result].map((item) => ({
    ...item,
    highlighted: item.name === searchName,
  }));
}

function logGraph(technologies: readonly TechnologyNode[]) {
  const edges = technologies.flatMap(({ name, blockedBy }) =>
    blockedBy.map((blockedBy1) => `"${blockedBy1.name}" -> "${name}";`)
  );

  const subgraphs = Object.entries(
    groupBy(
      uniq([
        ...technologies,
        ...technologies.flatMap((tech) => tech.blockedBy),
      ]),
      (tech) => tech.epoch
    )
  ).map(([epoch, subgraphTechs], index) => {
    const nodesText = subgraphTechs
      .map(
        (tech) =>
          `"${tech.name}" ${
            tech.highlighted ? '[fillcolor="#00ff00" fontcolor="black"]' : ''
          };`
      )
      .join('\n');
    return `
        subgraph cluster_${index} {
          label = "${epoch}";
          ${nodesText}
        }
      `;
  });

  const template = `
  strict digraph "dependency-cruiser output"{
    rankdir="LR" splines="true" overlap="false" nodesep="0.16" ranksep="0.18" fontname="Helvetica-bold" fontsize="9" style="rounded,bold,filled" fillcolor="#ffffff" compound="true"
    node [shape="box" style="rounded, filled" height="0.2" color="black" fillcolor="#ffffcc" fontcolor="black" fontname="Helvetica" fontsize="9"]
    edge [arrowhead="normal" arrowsize="0.6" penwidth="2.0" color="#00000033" fontname="Helvetica" fontsize="9"]

    ${subgraphs.join('\n')}

    ${edges.join('\n')}
  }
  `;

  console.log(template);
}

const techName = process.argv[2];
logGraph(extractTechnologyTree(techName));
