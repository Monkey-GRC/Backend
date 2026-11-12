import { AssignedPerson } from '../../domain/assignments/assignment.repository';
import { AssignmentItem } from '../../application/assignments/assignment-listing';

const person = (p: AssignedPerson | null) => (p ? { id: p.id, name: p.name, last_name: p.lastName, role: p.role } : null);

export const toAssignmentItem = (i: AssignmentItem) => ({
  client_control_id: i.clientControlId,
  code: i.code,
  requirement_codes: i.requirementCodes,
  name: i.name,
  service: i.service,
  categories: i.categories,
  assignment: i.assignment,
  owner: person(i.owner),
  executor: person(i.executor),
  state: i.state,
});
