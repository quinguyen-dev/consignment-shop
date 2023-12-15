import { Form } from "@remix-run/react";

export function FilterPane() {
  return (
    <Form className="flex flex-col">
      <input type="checkbox" name="this is the input" />
      <button type="submit">Filter</button>
    </Form>
  );
}
