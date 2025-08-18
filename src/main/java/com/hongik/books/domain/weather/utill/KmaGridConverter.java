package com.hongik.books.domain.weather.util;

public class KmaGridConverter {
    private static final double RE = 6371.00877;
    private static final double GRID = 5.0;
    private static final double SLAT1 = 30.0;
    private static final double SLAT2 = 60.0;
    private static final double OLON = 126.0;
    private static final double OLAT = 38.0;
    private static final double XO = 43.0;
    private static final double YO = 136.0;

    public static class Grid { public final int nx, ny; public Grid(int nx, int ny){this.nx=nx; this.ny=ny;} }

    public static Grid toGrid(double lat, double lon) {
        double DEGRAD = Math.PI / 180.0;
        double re = RE / GRID;
        double slat1 = SLAT1 * DEGRAD, slat2 = SLAT2 * DEGRAD;
        double olon = OLON * DEGRAD, olat = OLAT * DEGRAD;

        double sn = Math.tan(Math.PI*0.25 + slat2*0.5) / Math.tan(Math.PI*0.25 + slat1*0.5);
        sn = Math.log(Math.cos(slat1)/Math.cos(slat2)) / Math.log(sn);
        double sf = Math.tan(Math.PI*0.25 + slat1*0.5);
        sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
        double ro = Math.tan(Math.PI*0.25 + olat*0.5);
        ro = re * sf / Math.pow(ro, sn);

        double ra = Math.tan(Math.PI*0.25 + lat*DEGRAD*0.5);
        ra = re * sf / Math.pow(ra, sn);
        double theta = lon*DEGRAD - olon;
        if (theta > Math.PI) theta -= 2.0*Math.PI;
        if (theta < -Math.PI) theta += 2.0*Math.PI;
        theta *= sn;

        int x = (int)Math.floor(ra*Math.sin(theta) + XO + 0.5);
        int y = (int)Math.floor(ro - ra*Math.cos(theta) + YO + 0.5);
        return new Grid(x,y);
    }
}