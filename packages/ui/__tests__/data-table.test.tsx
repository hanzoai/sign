import React from 'react';

import assert from 'node:assert';
import { describe, it } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';

import type { DataTableColumnDef, DataTableInstance } from '../primitives/data-table';
import { DataTable } from '../primitives/data-table';

type Person = { id: string; name: string; email: string };

const people: Person[] = [
  { id: 'a', name: 'Ada', email: 'ada@example.com' },
  { id: 'b', name: 'Grace', email: 'grace@example.com' },
];

const columns: DataTableColumnDef<Person>[] = [
  { header: 'Name', accessorKey: 'name', size: 40 },
  { header: () => <em>Email</em>, accessorKey: 'email', cell: ({ row }) => row.original.email },
];

/** Renders the table once and hands back the markup and the instance its children were given. */
const render = (props: Partial<React.ComponentProps<typeof DataTable<Person>>> = {}) => {
  let instance: DataTableInstance<Person> | undefined;

  const html = renderToStaticMarkup(
    <DataTable columns={columns} data={people} {...props}>
      {(table) => {
        instance = table;

        return null;
      }}
    </DataTable>,
  );

  assert.ok(instance, 'children were never called with the table');

  return { html, table: instance };
};

describe('DataTable', () => {
  it('renders a header and a cell for every column of every row', () => {
    const { html } = render();

    assert.match(html, /<th[^>]*>Name<\/th>/);
    assert.match(html, /<th[^>]*><em>Email<\/em><\/th>/);

    for (const person of people) {
      assert.ok(html.includes(person.name), `${person.name} is missing`);
      assert.ok(html.includes(person.email), `${person.email} is missing`);
    }

    assert.strictEqual(html.match(/<tr/g)?.length, 1 + people.length);
  });

  it('sizes a cell from its column', () => {
    const { html } = render();

    assert.match(html, /<td[^>]*style="width:40px"[^>]*>Ada<\/td>/);
  });

  it('leaves out a column the caller hides', () => {
    const { html } = render({ columnVisibility: { email: false } });

    assert.ok(!html.includes('Email'));
    assert.ok(!html.includes('ada@example.com'));
    assert.ok(html.includes('Ada'));
  });

  it('reads the page it is on from the props, one-based', () => {
    const { table } = render({ currentPage: 3, perPage: 20, totalPages: 5 });

    assert.deepStrictEqual(table.state.pagination, { pageIndex: 2, pageSize: 20 });
    assert.strictEqual(table.getPageCount(), 5);
    assert.strictEqual(table.getCanPreviousPage(), true);
    assert.strictEqual(table.getCanNextPage(), true);

    // The server paged the data already: every row given is shown.
    assert.strictEqual(table.getRowModel().rows.length, people.length);
  });

  it('reports a page change one-based and leaves the paging to the caller', () => {
    const calls: [number, number][] = [];

    const { table } = render({
      currentPage: 1,
      perPage: 10,
      totalPages: 5,
      onPaginationChange: (page, perPage) => calls.push([page, perPage]),
    });

    table.nextPage();
    table.setPageIndex(4);

    assert.deepStrictEqual(calls, [
      [2, 10],
      [5, 10],
    ]);
  });

  it('marks the rows the caller selected, by the caller’s row id', () => {
    const { html, table } = render({
      enableRowSelection: true,
      rowSelection: { b: true },
      getRowId: (row) => row.id,
    });

    assert.strictEqual(html.match(/data-state="selected"/g)?.length, 1);
    assert.deepStrictEqual(
      table.getFilteredSelectedRowModel().rows.map((row) => row.original.name),
      ['Grace'],
    );
    assert.strictEqual(table.getIsAllPageRowsSelected(), false);
  });

  it('hands a new selection to the caller instead of keeping it', () => {
    const selections: Record<string, boolean>[] = [];

    const { table } = render({
      enableRowSelection: true,
      rowSelection: { b: true },
      getRowId: (row) => row.id,
      // react-table builds its maps without a prototype; compare by content.
      onRowSelectionChange: (selection) => selections.push({ ...selection }),
    });

    table.getRow('a').toggleSelected(true);
    table.toggleAllPageRowsSelected(false);

    assert.deepStrictEqual(selections, [{ a: true, b: true }, {}]);
  });
});
