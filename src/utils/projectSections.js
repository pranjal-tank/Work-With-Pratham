export function getProjectSections(projects, subsections, category = 'all') {
  const visibleProjects = projects.filter(
    (project) => category === 'all' || project.category === category,
  )
  const projectsById = new Map(visibleProjects.map((project) => [project.id, project]))
  const assigned = new Set()
  const inlineGroups = new Map()
  const groups = []

  for (const subsection of subsections) {
    if (category !== 'all' && subsection.category !== category) continue
    const members = []
    for (const id of subsection.projectIds) {
      const project = projectsById.get(id)
      if (!project || project.category !== subsection.category || assigned.has(id)) continue
      members.push(project)
      assigned.add(id)
    }
    if (!members.length) continue
    const group = { ...subsection, projects: members }
    if (subsection.inline) inlineGroups.set(members[0].id, group)
    else groups.push(group)
  }

  const sections = []
  let ungrouped
  for (const project of visibleProjects) {
    const inlineGroup = inlineGroups.get(project.id)
    if (inlineGroup) {
      sections.push(inlineGroup)
      ungrouped = undefined
    } else if (!assigned.has(project.id)) {
      if (!ungrouped) {
        ungrouped = { id: sections.length ? `ungrouped-${project.id}` : 'ungrouped', projects: [] }
        sections.push(ungrouped)
      }
      ungrouped.projects.push(project)
    }
  }
  return [...sections, ...groups]
}
