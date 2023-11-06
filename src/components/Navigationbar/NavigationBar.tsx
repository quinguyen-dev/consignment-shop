function NavigationBar() {
  return (
    <div className="flex flex-row space-x-2 px-4 pt-4">
      <div className="px-4 py-3 border text-gray-00">Placement Image</div>
      <input
        className="border-2 px-4 flex-1"
        placeholder="Search for items"
        type="search"
      />
      <button className="px-4 py-3 border-2 rounded-md">Login / Sign up</button>
    </div>
  );
}

export { NavigationBar };
