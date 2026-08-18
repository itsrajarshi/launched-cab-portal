// Manual jest mock for backend/supabase.js.
// Returns a chainable query builder whose final awaited value exposes
// { data, error } — matching how the routes destructure query results.

function makeBuilder(data = [], error = null) {
  return {
    data,
    error,
    select() {
      return this;
    },
    eq() {
      return this;
    },
    single() {
      return Promise.resolve({ data: this.data, error: this.error });
    },
    insert() {
      return this;
    },
    update() {
      return this;
    },
    delete() {
      return this;
    },
    order() {
      return this;
    },
  };
}

const supabaseMock = {
  from: jest.fn(() => makeBuilder()),
  makeBuilder,
};

module.exports = supabaseMock;