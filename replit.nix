{ pkgs }: {
	deps = [
   pkgs.nodePackages.prettier
   pkgs.postgresql
	pkgs.nodejs-19_x
	pkgs.nodePackages.typescript-language-server
	pkgs.nodePackages.yarn
	pkgs.replitPackages.jest
	pkgs.ocamlPackages.ssl
	pkgs.coreutils
	];
	# env = {
	#   LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [ pkgs.openssl_1_1.out ];
	# };
}
