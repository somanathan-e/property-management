import { entityConfigs } from "@/modules/management/config";
import { navigationSections } from "@/constants/navigation";

export function findNavigationItem(pathname: string) {
  for (const section of navigationSections) {
    const item = section.items.find((entry) => entry.href === pathname);
    if (item) {
      return item;
    }
  }

  return null;
}

export function resolveManagedConfig(pathname: string) {
  return entityConfigs[pathname] ?? null;
}
