export function remove_one_item_from_array<T>(arr: T[], item: T): T[] {
    let index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}